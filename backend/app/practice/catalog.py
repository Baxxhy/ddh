"""Versioned, entirely fictional training materials. No live business data."""
from copy import deepcopy


def demo_config(scenario: str) -> dict:
    if scenario == 'hospital':
        hospitals = []
        for h, name in [('a', '演示医院 A'), ('b', '演示医院 B')]:
            departments = []
            for d, title in [('internal', '内科'), ('surgery', '外科')]:
                doctors = []
                for n, label in [('general', '普通门诊'), ('special', '专科门诊')]:
                    doctor_id = f'{h}-{d}-{n}'
                    doctors.append({'id': doctor_id, 'label': label, 'slots': [
                        {'id': f'{doctor_id}-am', 'label': '演示时段 A（周一上午）'},
                        {'id': f'{doctor_id}-pm', 'label': '演示时段 B（周一下午）'}]})
                departments.append({'id': f'{h}-{d}', 'label': title, 'doctors': doctors})
            hospitals.append({'id': h, 'label': name, 'departments': departments})
        return {'engineVersion': 2, 'hospitals': hospitals, 'target': {'hospital': 'a', 'department': 'a-internal', 'doctor': 'a-internal-general', 'slot': 'a-internal-general-am'}, 'task': '请在演示医院 A 预约内科、普通门诊、演示时段 A（周一上午）。'}
    if scenario == 'payment':
        return {'engineVersion': 2, 'merchants': [{'id': 'a', 'label': '演示商户 A'}, {'id': 'b', 'label': '演示商户 B'}], 'target': {'merchant': 'a', 'amount_fen': 1250}, 'task': '请向演示商户 A 支付 12.50 元模拟金额。', 'maxAmountFen': 100000}
    return {'engineVersion': 2, 'task': '请找到公交乘车码，对准虚拟扫码器后完成模拟扫码。'}


def copy_config(scenario: str) -> dict:
    return deepcopy(demo_config(scenario))
