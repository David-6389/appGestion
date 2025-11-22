// auth.js - Lógica de autenticación de usuarios
import { supabase } from './supabase.js';

// Función para mostrar alertas (copiada de app.js para usarla aquí)
function mostrarAlerta(mensaje, tipo = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertContainer.appendChild(alerta);

    setTimeout(() => alerta.remove(), 5000);
}

// --- MANEJADOR DE LOGIN ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            mostrarAlerta(`Error: ${error.message}`, 'danger');
        } else {
            // Redirigir a la página principal si el login es exitoso
            window.location.href = '/index.html';
        }
    });
}

// --- MANEJADOR DE SIGNUP ---
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            mostrarAlerta(`Error: ${error.message}`, 'danger');
        } else {
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                 mostrarAlerta('Este usuario ya existe. Intenta iniciar sesión.', 'warning');
            } else {
                 mostrarAlerta('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.', 'success');
                 // Opcional: redirigir a una página de "revisa tu email" o al login
                 setTimeout(() => {
                    window.location.href = '/login.html';
                 }, 3000);
            }
        }
    });
}

function configurarVisualizacionPassword() {
    // Configurar para login
    
    const toggleLoginBtn = document.getElementById('toggleLoginPassword');
    const loginPassword = document.getElementById('login-password');
    
    if (toggleLoginBtn && loginPassword) {
        toggleLoginBtn.addEventListener('click', function() {
            togglePasswordVisibility(loginPassword, toggleLoginBtn);
        });
    }
    
    // Configurar para registro
    const toggleSignupBtn = document.getElementById('toggleSignupPassword');
    const registerPassword = document.getElementById('signup-password');
    
    if (toggleSignupBtn && registerPassword) {
        toggleSignupBtn.addEventListener('click', function() {
            togglePasswordVisibility(registerPassword, toggleSignupBtn);
        });
    }
    
    // Configurar para confirmar contraseña
    const toggleConfirmBtn = document.getElementById('toggleConfirmPassword');
    const confirmPassword = document.getElementById('confirm-password');
    
    if (toggleConfirmBtn && confirmPassword) {
        toggleConfirmBtn.addEventListener('click', function() {
            togglePasswordVisibility(confirmPassword, toggleConfirmBtn);
        });
    }
}

// Función auxiliar para cambiar la visibilidad
function togglePasswordVisibility(passwordInput, toggleButton) {
    const isPassword = passwordInput.type === 'password';
    
    if (isPassword) {
        // Mostrar contraseña
        passwordInput.type = 'text';
        toggleButton.innerHTML = '<i class="bi bi-eye"></i>';
        toggleButton.setAttribute('aria-label', 'Ocultar contraseña');
    } else {
        // Ocultar contraseña
        passwordInput.type = 'password';
        toggleButton.innerHTML = '<i class="bi bi-eye-slash"></i>';
        toggleButton.setAttribute('aria-label', 'Mostrar contraseña');
    }
}

document.addEventListener('DOMContentLoaded', configurarVisualizacionPassword);