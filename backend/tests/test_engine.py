import pytest
from backend.app.practice.engine import initial, transition, back, RuleError, amount_fen
from backend.app.practice.catalog import demo_config

PATHS = {
 'hospital': [('open_registration',None),('select_hospital','a'),('select_department','a-internal'),('select_doctor','a-internal-general'),('select_slot','a-internal-general-am'),('confirm_registration',None)],
 'bus': [('open_travel',None),('open_transport',None),('choose_bus',None),('open_bus_code',None),('align_and_scan',None)],
 'payment': [('open_scan',None),('scan_demo_code','a'),('continue_to_amount',None),('set_amount','12.50'),('confirm_payment',None)]}


@pytest.mark.parametrize('scene', PATHS)
def test_full_path(scene):
 state=initial(scene); config=demo_config(scene)
 for action,value in PATHS[scene]: state=transition(scene,state,config,action,value)
 assert state['result'] and '模拟' in state['result']['message']
 with pytest.raises(RuleError): transition(scene,state,config,PATHS[scene][-1][0])


@pytest.mark.parametrize('value',['','x','-1','0','0.00','1.234','1000.01','1e2','NaN',' 12.50',12.5,True,None])
def test_invalid_amounts(value):
 with pytest.raises(RuleError): amount_fen(value,100000)


def test_hospital_wrong_and_upstream_cleanup():
 config=demo_config('hospital');state=initial('hospital')
 for action,value in PATHS['hospital'][:-1]: state=transition('hospital',state,config,action,value)
 state=transition('hospital',state,config,'edit_hospital')
 state=transition('hospital',state,config,'select_hospital','b')
 assert state['selections']=={'hospital':'b'}
 with pytest.raises(RuleError): transition('hospital',state,config,'select_department','a-internal')
 for action,value in [('select_department','b-surgery'),('select_doctor','b-surgery-special'),('select_slot','b-surgery-special-pm')]: state=transition('hospital',state,config,action,value)
 with pytest.raises(RuleError): transition('hospital',state,config,'confirm_registration')
 state=transition('hospital',state,config,'edit_hospital')
 for action,value in PATHS['hospital'][1:]: state=transition('hospital',state,config,action,value)
 assert state['result']


def test_bus_branches_and_retry():
 config=demo_config('bus');state=initial('bus')
 assert back(transition('bus',state,config,'other_service'))['nodeId']=='B0'
 for action in ['open_travel','open_transport','choose_metro','choose_bus','open_bus_code']:state=transition('bus',state,config,action)
 with pytest.raises(RuleError):transition('bus',state,config,'scan_not_aligned')
 assert transition('bus',state,config,'align_and_scan')['result']


def test_payment_wrong_merchant_and_amount_recovery():
 config=demo_config('payment');state=initial('payment')
 for action,value in [('open_scan',None),('scan_demo_code','b'),('continue_to_amount',None),('set_amount','12.50')]:state=transition('payment',state,config,action,value)
 with pytest.raises(RuleError):transition('payment',state,config,'confirm_payment')
 state=transition('payment',state,config,'edit_merchant');state=transition('payment',state,config,'scan_demo_code','a')
 assert 'amount_fen' not in state['selections']
 state=transition('payment',state,config,'continue_to_amount');state=transition('payment',state,config,'set_amount','1.00')
 with pytest.raises(RuleError):transition('payment',state,config,'confirm_payment')
 state=transition('payment',state,config,'edit_amount');state=transition('payment',state,config,'set_amount','12.50')
 assert transition('payment',state,config,'confirm_payment')['result']
