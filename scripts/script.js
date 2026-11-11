document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#form');
    const signUpButton = document.querySelector('#btn');
    const textFields = document.querySelectorAll('.form-input.check');
    const fullNameInput = textFields[0];
    const usernameInput = textFields[1];
    const emailInput = textFields[2];
    const passwordInput = textFields[3];
    const repeatPasswordInput = textFields[4];
    const agreeCheckbox = document.querySelector('#agree');
    const loginLink = document.querySelector('.question');
    const pageTitle = document.querySelector('.form-section h1');
    const pageSubtitle = document.querySelector('.form-section p');
    const fullNameGroup = fullNameInput.closest('.field-group');
    const usernameGroup = usernameInput.closest('.field-group');
    const passwordGroup = passwordInput.closest('.field-group');
    const emailGroup = emailInput.closest('.field-group');
    const repeatPasswordGroup = repeatPasswordInput.closest('.field-group');
    const checkboxGroup = agreeCheckbox.closest('.field-group');

    function showFieldError(input, message) {
        const group = input.closest('.field-group') || input.closest('label');
        if (!group) {
            return;
        }

        input.classList.add('input-error');

        let errorEl = group.querySelector('.field-error');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'field-error';
            group.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }

    function clearFieldError(input) {
        const group = input.closest('.field-group') || input.closest('label');
        if (!group) {
            return;
        }

        input.classList.remove('input-error');
        const errorEl = group.querySelector('.field-error');
        if (errorEl) {
            errorEl.remove();
        }
    }

    let isLoginPage = false;
    let isAccountPage = false;

    const fullNamePattern = /^[A-Za-z\s]+$/;
    const usernamePattern = /^[A-Za-z0-9_-]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function isPasswordValid(password) {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password)
        );
    }

    function getPasswordErrorMessage() {
        return (
            'Пароль должен содержать минимум 8 символов, среди которых есть: ' +
            'хотя бы одна буква в верхнем регистре, хотя бы одна цифра, хотя бы один спецсимвол'
        );
    }

    const CLIENTS_STORAGE_KEY = 'clients';

    function getClients() {
        const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
        if (!stored) {
            return [];
        }

        try {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function saveClient(client) {
        const clients = getClients();
        clients.push(client);
        localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    }

    for (const field of textFields) {
        field.addEventListener('input', function () {
            if (field === fullNameInput) {
                const value = field.value.trim();
                if (value !== '' && fullNamePattern.test(value)) {
                    clearFieldError(field);
                }
                return;
            }

            if (field === usernameInput) {
                const value = field.value.trim();
                if (value !== '' && usernamePattern.test(value)) {
                    clearFieldError(field);
                }
                return;
            }

            if (field === emailInput) {
                const value = field.value.trim();
                if (value !== '' && emailPattern.test(value)) {
                    clearFieldError(field);
                }
                return;
            }

            if (field === passwordInput) {
                if (isPasswordValid(field.value)) {
                    clearFieldError(field);
                }
                return;
            }

            if (field === repeatPasswordInput) {
                if (
                    field.value !== '' &&
                    field.value === passwordInput.value
                ) {
                    clearFieldError(field);
                }
                return;
            }

            if (field.value.trim() !== '') {
                clearFieldError(field);
            }
        });
    }

    fullNameInput.addEventListener('keydown', function (event) {
        if (event.key >= '0' && event.key <= '9') {
            event.preventDefault();
        }
    });

    usernameInput.addEventListener('keydown', function (event) {
        if (event.key === '.' || event.key === ',') {
            event.preventDefault();
        }
    });

    agreeCheckbox.addEventListener('change', function () {
        if (agreeCheckbox.checked) {
            clearFieldError(agreeCheckbox);
        }
    });

    function signUp() {
        for (const field of textFields) {
            clearFieldError(field);
        }
        clearFieldError(agreeCheckbox);

        let hasEmptyField = false;

        for (const field of textFields) {
            if (field.value.trim() === '') {
                showFieldError(field, `Заполните поле ${field.placeholder}`);
                hasEmptyField = true;
            }
        }

        if (hasEmptyField) {
            return;
        }

        if (!fullNamePattern.test(fullNameInput.value.trim())) {
            showFieldError(
                fullNameInput,
                'Full Name может содержать только буквы и пробел',
            );
            return;
        }

        if (!usernamePattern.test(usernameInput.value.trim())) {
            showFieldError(
                usernameInput,
                'Your username может содержать только буквы, цифры, символ подчеркивания и тире',
            );
            return;
        }

        if (!emailPattern.test(emailInput.value.trim())) {
            showFieldError(emailInput, 'Введите корректный E-mail');
            return;
        }

        if (!isPasswordValid(passwordInput.value)) {
            showFieldError(passwordInput, getPasswordErrorMessage());
            return;
        }

        if (passwordInput.value !== repeatPasswordInput.value) {
            showFieldError(
                repeatPasswordInput,
                'Password и Repeat Password должны совпадать',
            );
            return;
        }

        if (!agreeCheckbox.checked) {
            showFieldError(
                agreeCheckbox,
                'Необходимо согласиться с условиями',
            );
            return;
        }

        saveClient({
            fullName: fullNameInput.value.trim(),
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value,
        });

        showSuccessModal();
    }

    function showSuccessModal() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'modal';

        const text = document.createElement('p');
        text.className = 'modal-text';
        text.textContent = 'На вашу почту выслана ссылка, перейдите по ней, чтобы завершить регистрацию';

        const okButton = document.createElement('button');
        okButton.className = 'button modal-button';
        okButton.type = 'button';
        okButton.textContent = 'ОК';

        okButton.addEventListener('click', function () {
            overlay.remove();
            form.reset();
            switchToLoginPage();
        });

        modal.appendChild(text);
        modal.appendChild(okButton);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    function switchToLoginPage() {
        if (isLoginPage) {
            return;
        }

        isLoginPage = true;

        textFields.forEach(function (field) {
            clearFieldError(field);
        });
        clearFieldError(agreeCheckbox);

        pageTitle.textContent = 'Log in to the system';
        fullNameGroup.remove();
        emailGroup.remove();
        repeatPasswordGroup.remove();
        checkboxGroup.remove();

        loginLink.textContent = 'Registration';

        signUpButton.textContent = 'Sign In';
        signUpButton.removeEventListener('click', signUp);
        signUpButton.addEventListener('click', signIn);
    }

    function switchToAccountPage(user) {
        if (isAccountPage) {
            return;
        }

        isAccountPage = true;

        pageTitle.textContent = `Welcome, ${user.fullName}!`;
        pageSubtitle.remove();
        usernameGroup.remove();
        passwordGroup.remove();
        loginLink.remove();

        signUpButton.textContent = 'Exit';
        signUpButton.removeEventListener('click', signIn);
        signUpButton.addEventListener('click', exitAccount);
    }

    function exitAccount() {
        location.reload();
    }

    function signIn() {
        clearFieldError(usernameInput);
        clearFieldError(passwordInput);

        let hasEmptyField = false;

        if (usernameInput.value.trim() === '') {
            showFieldError(usernameInput, 'Заполните поле Your username');
            hasEmptyField = true;
        }

        if (passwordInput.value.trim() === '') {
            showFieldError(passwordInput, 'Заполните поле Password');
            hasEmptyField = true;
        }

        if (hasEmptyField) {
            return;
        }

        const username = usernameInput.value.trim();
        const clients = getClients();
        const user = clients.find(function (client) {
            return client.username === username;
        });

        if (!user) {
            showFieldError(usernameInput, 'Такой пользователь не зарегистрирован');
            return;
        }

        if (user.password !== passwordInput.value) {
            showFieldError(passwordInput, 'Неверный пароль');
            return;
        }

        switchToAccountPage(user);
    }

    document.querySelectorAll('.password-toggle').forEach(function (button) {
        button.addEventListener('click', function () {
            const input = button.parentElement.querySelector('.form-input');
            const showPassword = input.type === 'password';

            input.type = showPassword ? 'text' : 'password';
            button.classList.toggle('is-visible', showPassword);
            button.setAttribute(
                'aria-label',
                showPassword ? 'Скрыть пароль' : 'Показать пароль'
            );
        });
    });

    signUpButton.addEventListener('click', signUp);

    loginLink.addEventListener('click', function (event) {
        event.preventDefault();

        if (isLoginPage) {
            location.reload();
            return;
        }

        switchToLoginPage();
    });
});
