"""Versioned, entirely fictional training materials. No live business data."""


def demo_config(scenario: str) -> dict:
    if scenario == 'hospital':
        hospitals = []
        for h, name in [('a', '青禾医院'), ('b', '安和医院')]:
            departments = []
            for d, title in [('internal', '内科'), ('surgery', '外科')]:
                doctors = []
                for n, label in [('general', '普通门诊'), ('special', '专科门诊')]:
                    doctor_id = f'{h}-{d}-{n}'
                    doctors.append({'id': doctor_id, 'label': label, 'slots': [
                        {'id': f'{doctor_id}-am', 'label': '周一上午 09:00–09:30'},
                        {'id': f'{doctor_id}-pm', 'label': '周一下午 14:00–14:30'}]})
                departments.append({'id': f'{h}-{d}', 'label': title, 'doctors': doctors})
            hospitals.append({'id': h, 'label': name, 'departments': departments})
        return {'engineVersion': 2, 'hospitals': hospitals, 'target': {'hospital': 'a', 'department': 'a-internal', 'doctor': 'a-internal-general', 'slot': 'a-internal-general-am'}, 'task': '请在青禾医院 预约内科、普通门诊、周一上午 09:00–09:30。'}
    if scenario == 'payment':
        return {'engineVersion': 2, 'merchants': [{'id': 'a', 'label': '晨光便利店'}, {'id': 'b', 'label': '邻里水果店'}], 'target': {'merchant': 'a', 'amount_fen': 1250}, 'task': '请向晨光便利店 支付 12.50 元模拟金额。', 'maxAmountFen': 100000}
    return {'engineVersion': 2, 'task': '请找到公交乘车码，对准虚拟扫码器后完成模拟扫码。'}
