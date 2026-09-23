(function () {
    var defaults = {
        merchantName: "Sadad General Trading Co",
        amount: "2000.000",
        currency: "KD",
        customerMessage: ""
    };
    var form = document.getElementById("invoiceSettings");
    var feedback = document.getElementById("feedback");
    var invoiceList = document.getElementById("invoiceList");
    var invoiceCount = document.getElementById("invoiceCount");
    var emptyState = document.getElementById("emptyState");
    var saveButton = document.getElementById("saveButton");
    var cancelEdit = document.getElementById("cancelEdit");
    var editingId = null;

    function getConfig() {
        try {
            return Object.assign({}, defaults, JSON.parse(localStorage.getItem("invoiceConfig") || "null") || {});
        } catch (error) {
            return Object.assign({}, defaults);
        }
    }

    function getInvoices() {
        try {
            return JSON.parse(localStorage.getItem("invoices") || "[]");
        } catch (error) {
            return [];
        }
    }

    function saveInvoices(invoices) {
        localStorage.setItem("invoices", JSON.stringify(invoices));
    }

    function makeId() {
        return "INV-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    }

    function formatDate(value) {
        return new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
    }

    function invoiceLink(invoice) {
        return new URL("index.html?invoice=" + encodeURIComponent(invoice.id), window.location.href).href;
    }

    function render(config) {
        document.getElementById("merchantName").value = config.merchantName;
        document.getElementById("amount").value = config.amount;
        document.getElementById("currency").value = config.currency;
        document.getElementById("customerMessage").value = config.customerMessage;
        document.getElementById("previewMerchant").textContent = config.merchantName;
        document.getElementById("previewAmount").textContent = config.amount;
        document.getElementById("previewCurrency").textContent = config.currency;
        document.getElementById("previewMessage").textContent = config.customerMessage;
        document.getElementById("previewMessage").hidden = !config.customerMessage;
    }

    function renderInvoices() {
        var invoices = getInvoices();
        invoiceCount.textContent = invoices.length + " فواتير";
        emptyState.hidden = invoices.length > 0;
        invoiceList.innerHTML = invoices.map(function (invoice) {
            return '<article class="invoice-item">' +
                '<div class="invoice-item-main"><span class="invoice-id">' + invoice.id + '</span>' +
                '<h3>' + escapeHtml(invoice.merchantName) + '</h3>' +
                '<p>' + escapeHtml(invoice.amount + " " + invoice.currency) + ' <span>•</span> ' + formatDate(invoice.createdAt) + '</p></div>' +
                '<div class="invoice-item-actions"><button class="icon-action copy-action" data-id="' + invoice.id + '" type="button">نسخ الرابط</button>' +
                '<button class="icon-action edit-action" data-id="' + invoice.id + '" type="button">تعديل</button>' +
                '<button class="icon-action delete-action" data-id="' + invoice.id + '" type="button">حذف</button></div>' +
                '</article>';
        }).join("");
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, function (character) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
        });
    }

    function startEdit(invoice) {
        editingId = invoice.id;
        render(invoice);
        saveButton.querySelector("span").textContent = "حفظ التعديلات";
        cancelEdit.hidden = false;
        form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function resetForm() {
        editingId = null;
        render(getConfig());
        saveButton.querySelector("span").textContent = "إضافة فاتورة";
        cancelEdit.hidden = true;
    }

    render(getConfig());

    form.addEventListener("input", function () {
        render({
            merchantName: form.merchantName.value,
            amount: form.amount.value,
            currency: form.currency.value,
            customerMessage: form.customerMessage.value
        });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!form.reportValidity()) {
            return;
        }
        var amount = Number(form.amount.value);
        if (!Number.isFinite(amount) || amount <= 0) {
            form.amount.setCustomValidity("أدخل مبلغًا صحيحًا");
            form.amount.reportValidity();
            form.amount.setCustomValidity("");
            return;
        }
        var config = {
            merchantName: form.merchantName.value.trim(),
            amount: amount.toFixed(3),
            currency: form.currency.value,
            customerMessage: form.customerMessage.value.trim()
        };
        var invoices = getInvoices();
        if (editingId) {
            invoices = invoices.map(function (invoice) {
                return invoice.id === editingId ? Object.assign({}, invoice, config, { updatedAt: new Date().toISOString() }) : invoice;
            });
        } else {
            invoices.unshift(Object.assign({}, config, { id: makeId(), createdAt: new Date().toISOString() }));
        }
        saveInvoices(invoices);
        localStorage.setItem("invoiceConfig", JSON.stringify(config));
        render(config);
        renderInvoices();
        feedback.textContent = editingId ? "تم تعديل الفاتورة بنجاح" : "تمت إضافة الفاتورة بنجاح";
        feedback.className = "feedback success";
        resetForm();
        window.setTimeout(function () { feedback.textContent = ""; }, 3000);
    });

    cancelEdit.addEventListener("click", resetForm);

    invoiceList.addEventListener("click", function (event) {
        var button = event.target.closest("button[data-id]");
        if (!button) {
            return;
        }
        var id = button.getAttribute("data-id");
        var invoices = getInvoices();
        var invoice = invoices.find(function (item) { return item.id === id; });
        if (!invoice) {
            return;
        }
        if (button.classList.contains("copy-action")) {
            navigator.clipboard.writeText(invoiceLink(invoice)).then(function () {
                feedback.textContent = "تم نسخ رابط الفاتورة";
                feedback.className = "feedback success";
            });
        } else if (button.classList.contains("edit-action")) {
            startEdit(invoice);
        } else if (button.classList.contains("delete-action") && window.confirm("هل تريد حذف هذه الفاتورة؟")) {
            saveInvoices(invoices.filter(function (item) { return item.id !== id; }));
            if (editingId === id) {
                resetForm();
            }
            renderInvoices();
        }
    });

    renderInvoices();
})();
