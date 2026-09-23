(function () {
    var defaults = {
        merchantName: "Sadad General Trading Co",
        amount: "2000.000",
        currency: "KD",
        customerMessage: ""
    };
    var invoiceId = new URLSearchParams(window.location.search).get("invoice");
    var confirmationCode = document.getElementById("confirmationCode");
    var confirmButton = document.getElementById("confirmButton");
    var cancelButton = document.getElementById("cancelButton");
    var codeFeedback = document.getElementById("codeFeedback");

    function readPaymentDetails() {
        try {
            return JSON.parse(sessionStorage.getItem("paymentConfirmation") || "null") || {};
        } catch (error) {
            return {};
        }
    }

    function readLocalInvoice() {
        try {
            var invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
            return invoices.find(function (invoice) { return invoice.id === invoiceId; }) || null;
        } catch (error) {
            return null;
        }
    }

    function readInvoice() {
        var localInvoice = readLocalInvoice();
        if (localInvoice || !invoiceId) {
            return Promise.resolve(localInvoice || defaults);
        }
        return fetch("data/invoices.json")
            .then(function (response) { return response.ok ? response.json() : []; })
            .then(function (invoices) {
                return invoices.find(function (invoice) { return invoice.id === invoiceId; }) || defaults;
            })
            .catch(function () { return defaults; });
    }

    readInvoice().then(function (invoice) {
        var paymentDetails = readPaymentDetails();
        document.getElementById("confirmationMerchant").textContent = invoice.merchantName;
        document.getElementById("confirmationCurrency").textContent = invoice.currency;
        document.getElementById("confirmationAmount").textContent = invoice.amount;
        if (paymentDetails.cardNumber) {
            document.getElementById("confirmationCard").textContent = paymentDetails.cardNumber;
        }
        if (paymentDetails.expiry) {
            document.getElementById("confirmationExpiry").textContent = paymentDetails.expiry;
        }

        document.getElementById("confirmationPin").textContent = "****";
    });

    confirmationCode.addEventListener("input", function () {
        confirmationCode.value = confirmationCode.value.replace(/\D/g, "").slice(0, 6);
        confirmButton.disabled = confirmationCode.value.length !== 6;
        codeFeedback.textContent = "";
    });

    confirmButton.addEventListener("click", function () {
        codeFeedback.textContent = "تم استلام رمز التحقق (محاكاة تجريبية)";
        confirmationCode.disabled = true;
        confirmButton.disabled = true;
    });

    cancelButton.addEventListener("click", function () {
        codeFeedback.textContent = "تم إلغاء العملية التجريبية";
        confirmationCode.disabled = true;
        confirmButton.disabled = true;
    });
})();