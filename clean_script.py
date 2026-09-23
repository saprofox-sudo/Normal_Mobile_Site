import re
import os

html_path = 'd:/SAPRO FOX/pvate/Normal_Mobile_Site/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace validateCard function
validate_card_regex = re.compile(r'function validateCard\(val, checkLength\).*?url: url.*?success : function.*?\}\s*\}\s*\);\s*\}', re.DOTALL)
new_validate_card = '''function validateCard(val, checkLength) {
\t$("#logodetails").hide();
\tcardBinErrorMsg=false;
\tvar $validationMsg = $('#ValidationMessage');
\tdocument.getElementById('ARPaypageCardNumberEmptyErrorMessage').innerHTML = 'يرجى إدخال رقم البطاقة';
\tdocument.getElementById('ARPaypageCardNumberInvalidErrorMessage').innerHTML = 'الرجاء إدخال رقم بطاقة صالح';
\tif ($validationMsg.text().trim() === "" ||
\tdocument.getElementById('ValidationMessage').innerHTML == document.getElementById('ARPaypageCardNumberInvalidErrorMessage').innerHTML ||
\tdocument.getElementById('ValidationMessage').innerHTML == document.getElementById('ARPaypageCardNumberEmptyErrorMessage').innerHTML) {
\t\tdocument.getElementById('ValidationMessage').innerHTML="";
\t\tdocument.getElementById('debitNumber').style.borderColor='';
\t\t$("#ValidationMessage").hide();
\t}
\tdocument.getElementById('proceed').disabled=false;
\tbrdtype = "VISA";
\tcardLenFlag = true;
}'''
content = validate_card_regex.sub(new_validate_card, content)

# 2. Replace onPay and everything up to the next script tag
onpay_regex = re.compile(r'function onPay\(\).*?function onclckCancel\(\)\s*\{.*?\}', re.DOTALL)
new_onpay = '''function onPay()
{
\tdocument.getElementById('ValidationMessage').innerHTML = '';
\t$("#ValidationMessage").hide();
\treturn openMockConfirmation();
}
function onclckCancel() {
\twindow.location.href = "cancel.html";
}'''
content = onpay_regex.sub(new_onpay, content)

# 3. Write back
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
