"""Pure deterministic transitions. The HTTP layer never chooses success."""
from copy import deepcopy
import re


class RuleError(ValueError):
    pass


START = {'hospital': 'H0', 'bus': 'B0', 'payment': 'P0'}
TITLES = dict(H0='模拟医疗服务', H1='选择医院', H2='选择科室', H3='选择门诊', H4='选择就诊时间', H5='核对预约信息', H6='模拟预约成功', HX='其他医疗服务', B0='模拟生活服务', B1='出行服务', B2='选择交通类型', B3='公交服务', B4='模拟公交乘车码', B6='模拟乘车成功', BM='模拟地铁服务', BX='其他生活服务', P0='模拟支付应用', P1='选择收款码', P2='查看收款方', P3='输入模拟金额', P4='核对付款信息', P5='模拟支付成功', PX='其他支付服务')
NOTICES = {'hospital': '模拟预约成功，没有产生真实挂号记录。', 'bus': '模拟乘车成功，没有产生真实乘车记录或扣费。', 'payment': '模拟支付成功，没有发生真实资金交易。'}


def initial(scenario: str) -> dict:
    return {'nodeId': START[scenario], 'selections': {}, 'returnStack': [], 'result': None}


def find(rows: list, value: object) -> dict:
    for row in rows:
        if row['id'] == value:
            return row
    raise RuleError('这个选项不属于当前页面，请重新选择。')


def hospital_options(config: dict, selections: dict, key: str) -> list:
    rows = config['hospitals']
    if key == 'hospital': return rows
    rows = find(rows, selections.get('hospital'))['departments']
    if key == 'department': return rows
    rows = find(rows, selections.get('department'))['doctors']
    if key == 'doctor': return rows
    return find(rows, selections.get('doctor'))['slots']


def actions(scenario: str, state: dict, config: dict) -> list[dict]:
    node, selected = state['nodeId'], state['selections']
    def button(id: str, label: str, options: list | None = None, input: bool = False) -> dict:
        return {'id': id, 'label': label, 'options': [{'id': x['id'], 'label': x['label']} for x in options or []], 'input': input}
    fixed = {
        'H0': [('open_registration', '预约挂号'), ('other_service', '查看其他医疗服务')],
        'H5': [('confirm_registration', '确认模拟预约'), ('edit_hospital', '修改医院'), ('edit_department', '修改科室'), ('edit_doctor', '修改门诊'), ('edit_slot', '修改时间')],
        'B0': [('open_travel', '出行'), ('other_service', '查看其他生活服务')], 'B1': [('open_transport', '交通服务')],
        'B2': [('choose_bus', '公交'), ('choose_metro', '地铁')], 'B3': [('open_bus_code', '公交乘车码')],
        'B4': [('scan_not_aligned', '未对准，尝试扫码'), ('align_and_scan', '对准虚拟扫码器，模拟扫码')],
        'BM': [('choose_bus', '切换到公交')],
        'P0': [('open_scan', '扫一扫'), ('other_service', '查看其他支付服务')],
        'P2': [('continue_to_amount', '确认收款方，填写金额')],
        'P4': [('confirm_payment', '确认模拟付款'), ('edit_amount', '修改金额'), ('edit_merchant', '更换商户')],
    }
    if node in ['H1','H2','H3','H4']:
        key = ['hospital','department','doctor','slot'][int(node[1])-1]
        return [button('select_'+key, TITLES[node], hospital_options(config, selected, key))]
    if node == 'P1': return [button('scan_demo_code', '选择收款码', config['merchants'])]
    if node == 'P3': return [button('set_amount', '核对付款信息', input=True)]
    return [button(id, label) for id, label in fixed.get(node, [])]


def amount_fen(value: object, maximum: int) -> int:
    if not isinstance(value, str) or not re.fullmatch(r'\d{1,6}(?:\.\d{1,2})?', value):
        raise RuleError('请输入大于零、最多两位小数的金额，例如 12.50。')
    whole, _, fraction = value.partition('.')
    result = int(whole) * 100 + int(fraction.ljust(2, '0'))
    if not 0 < result <= maximum:
        raise RuleError(f'金额应大于零，且不超过 {maximum // 100} 元。')
    return result


def transition(scenario: str, state: dict, config: dict, action: str, value: object = None) -> dict:
    state = deepcopy(state)
    node, selections = state['nodeId'], state['selections']
    available = actions(scenario, state, config)
    spec = next((x for x in available if x['id'] == action), None)
    if spec is None: raise RuleError('当前页面不能执行这个操作，请按页面提示选择。')
    if spec['options']: find(spec['options'], value)
    elif not spec['input'] and value is not None: raise RuleError('这个操作不需要附加内容，请重新操作。')
    destination = None
    if action.startswith('select_'):
        key = action[7:]
        dependencies = ['hospital','department','doctor','slot']
        if selections.get(key) != value:
            for child in dependencies[dependencies.index(key)+1:]: selections.pop(child, None)
        selections[key] = value
        destination = 'H' + str(int(node[1])+1)
    elif action == 'scan_demo_code':
        if selections.get('merchant') != value:
            selections.pop('amount_fen', None)
        selections['merchant'] = value
        destination = 'P2'
    elif action == 'set_amount':
        selections['amount_fen'] = amount_fen(value, config['maxAmountFen'])
        destination = 'P4'
    elif action in ['confirm_registration', 'confirm_payment']:
        target = config['target']
        if any(selections.get(key) != expected for key, expected in target.items()):
            raise RuleError('当前信息与练习任务不符，请核对任务，并点击修改后重新确认。')
        # Re-check hierarchy instead of trusting stored selections.
        if scenario == 'hospital':
            for key in ['hospital','department','doctor','slot']: find(hospital_options(config, selections, key), selections.get(key))
        else: find(config['merchants'], selections.get('merchant'))
        destination = 'H6' if scenario == 'hospital' else 'P5'
        state['result'] = {'message': NOTICES[scenario], 'selections': deepcopy(selections)}
    elif action.startswith('edit_'):
        destination = {'edit_hospital':'H1','edit_department':'H2','edit_doctor':'H3','edit_slot':'H4','edit_amount':'P3','edit_merchant':'P1'}[action]
    elif action == 'scan_not_aligned':
        raise RuleError('模拟扫码未对准，请点击“对准虚拟扫码器，模拟扫码”再试一次。')
    else:
        destination = {'open_registration':'H1','open_travel':'B1','open_transport':'B2','choose_bus':'B3','choose_metro':'BM','open_bus_code':'B4','align_and_scan':'B6','open_scan':'P1','continue_to_amount':'P3'}.get(action)
        if action == 'other_service': destination = {'hospital':'HX','bus':'BX','payment':'PX'}[scenario]
        if action == 'align_and_scan': state['result'] = {'message': NOTICES[scenario], 'selections': {}}
    # Hospital/payment navigation is a linear page hierarchy, independent of
    # whether a choice changed. Editing discards the old forward path only.
    path = navigation_path(destination)
    state['returnStack'] = path if path is not None else (state['returnStack'] + [{'nodeId': node}])[-20:]
    state['nodeId'] = destination
    return state


def navigation_path(node: str) -> list[dict] | None:
    for pages in [['H0','H1','H2','H3','H4','H5','H6'], ['P0','P1','P2','P3','P4','P5']]:
        if node in pages:
            return [{'nodeId': page} for page in pages[:pages.index(node)]]
    return None


def back(state: dict) -> dict:
    state = deepcopy(state)
    path = navigation_path(state['nodeId'])
    if path is not None: state['returnStack'] = path
    if state['result'] or not state['returnStack']: raise RuleError('当前页面不能返回，请重新开始或返回首页。')
    state['nodeId'] = state['returnStack'].pop()['nodeId']
    return state


def summary(scenario: str, state: dict, config: dict) -> dict[str, str]:
    selected = state['selections']
    result = {}
    if scenario == 'hospital':
        for key, label in [('hospital','医院'),('department','科室'),('doctor','门诊'),('slot','就诊时间')]:
            if key in selected: result[label] = find(hospital_options(config, selected, key), selected[key])['label']
    elif scenario == 'payment':
        if 'merchant' in selected: result['收款方'] = find(config['merchants'], selected['merchant'])['label']
        if 'amount_fen' in selected: result['模拟金额'] = f"{selected['amount_fen']//100}.{selected['amount_fen']%100:02d} 元"
    return result
