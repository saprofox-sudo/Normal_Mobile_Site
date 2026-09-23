(function () {
    var defaults = {
        merchantName: "Sadad General Trading Co",
        amount: "2000.000",
        currency: "KD",
        customerMessage: ""
    };
    var params = new URLSearchParams(window.location.search);
    var invoiceId = params.get("invoice");

    function readInvoice() {
        try {
            var invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
            var selected = invoices.find(function (invoice) { return invoice.id === invoiceId; });
            if (selected) {
                return selected;
            }
            return Object.assign({}, defaults, JSON.parse(localStorage.getItem("invoiceConfig") || "null") || {});
        } catch (error) {
            return Object.assign({}, defaults);
        }
    }

    function formatDate(value) {
        var date = value ? new Date(value) : new Date();
        return new Intl.DateTimeFormat("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }).format(date);
    }

    var invoice = readInvoice();
    document.getElementById("invoiceDate").textContent = formatDate(invoice.createdAt);
    document.getElementById("merchantName").textContent = invoice.merchantName;
    document.getElementById("currency").textContent = invoice.currency;
    document.getElementById("amount").textContent = invoice.amount;
    document.getElementById("payButton").href = "index.html" + window.location.search;

    if (invoice.customerMessage) {
        var message = document.getElementById("customerMessage");
        message.textContent = invoice.customerMessage;
        message.hidden = false;
    }

    document.getElementById("rejectButton").addEventListener("click", function () {
        var feedback = document.getElementById("feedback");
        feedback.textContent = "تم رفض طلب الدفع";
        feedback.style.color = "#d0072f";
    });
})();
