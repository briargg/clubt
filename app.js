// Inicializa Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB89PuH-5zSpQpI1QASHrEcrQvtUWsDn7A",
  authDomain: "clubalmacen.firebaseapp.com",
  projectId: "clubalmacen",
  storageBucket: "clubalmacen.appspot.com",
  messagingSenderId: "284091950744",
  appId: "1:284091950744:web:578d9d1aae581225d592ed",
  measurementId: "G-MWHWM339Y2"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Obtener solo los clientes
db.collection("users").where("role", "==", "cliente")
  .get()
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
    });
  })
  .catch((error) => {
    console.error("Error obteniendo clientes:", error);
  });


// Elementos del DOM
const signupButton = document.getElementById("signupButton");
const loginButton = document.getElementById("loginButton");
const clienteButton = document.getElementById("clienteButton");
const comercianteButton = document.getElementById("comercianteButton");
const authContainer = document.getElementById("authContainer");
const userDetails = document.getElementById("userDetails");
const clienteDetails = document.getElementById("clienteDetails");
const comercianteDetails = document.getElementById("comercianteDetails");

// Registro de usuario
signupButton.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            alert("Usuario registrado con éxito");
            showRoleSelection(userCredential.user);
        })
        .catch(error => alert(error.message));
});

// Inicio de sesión
loginButton.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            alert("Inicio de sesión exitoso");
            checkUserRole(userCredential.user);
        })
        .catch(error => alert(error.message));
});

// Función para mostrar la selección de rol
function showRoleSelection(user) {
    authContainer.style.display = "none";
    userDetails.style.display = "block";
    
    clienteButton.addEventListener("click", () => assignRole(user, "cliente"));
    comercianteButton.addEventListener("click", () => assignRole(user, "comerciante"));
}

// Asignar rol y guardarlo en Firestore
function assignRole(user, role) {
    db.collection("users").doc(user.uid).set({
        email: user.email,
        role: role
    })
    .then(() => {
        alert("Rol asignado: " + role);
        checkUserRole(user);
    })
    .catch(error => alert("Error al asignar rol: " + error.message));
}

// Comprobar el rol del usuario
function checkUserRole(user) {
    db.collection("users").doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                const role = doc.data().role;
                userDetails.style.display = "none";

                if (role === "cliente") {
                    clienteDetails.style.display = "block";
                } else if (role === "comerciante") {
                    comercianteDetails.style.display = "block";
                }
            } else {
                showRoleSelection(user);
            }
        })
        .catch(error => alert("Error al obtener el rol: " + error.message));
}

// Verifica si el usuario ya está autenticado
auth.onAuthStateChanged(user => {
    if (user) {
        checkUserRole(user);
    }
});

const clienteSelect = document.getElementById("clienteSelect");

// Función para cargar clientes en la lista
async function cargarClientes() {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const clientesRef = db.collection("users").where("role", "==", "cliente");
        const snapshot = await clientesRef.get();

        clienteSelect.innerHTML = '<option value="">Seleccionar Cliente</option>';

        snapshot.forEach(doc => {
            const clienteData = doc.data();
            const option = document.createElement("option");
            option.value = doc.id; // UID del cliente
            option.textContent = clienteData.email;
            clienteSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar clientes:", error);
    }
}

// Llamar a la función después de que el comerciante inicie sesión
auth.onAuthStateChanged(user => {
    if (user) {
        cargarClientes();
    }
});
const habilitarFiadoButton = document.getElementById("habilitarFiadoButton");

habilitarFiadoButton.addEventListener("click", async () => {
    const clienteUID = clienteSelect.value;
    const montoFiado = parseFloat(document.getElementById("montoFiado").value);
    const comerciante = auth.currentUser;

    if (!clienteUID || isNaN(montoFiado) || montoFiado <= 0) {
        alert("Selecciona un cliente e ingresa un monto válido.");
        return;
    }

    try {
        // Guardar fiado en la subcolección del comerciante
        await db.collection("users").doc(comerciante.uid)
            .collection("fiados").doc(clienteUID).set({
                monto_fiado: montoFiado,
                fecha_inicio: new Date().toISOString()
            });

        alert("Fiado habilitado correctamente.");
    } catch (error) {
        console.error("Error al habilitar fiado:", error.message);
        alert("Error al habilitar fiado: " + error.message);
    }
});
document.getElementById('loginButton').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;
  
      // Leer el rol desde Firestore
      const userDoc = await firebase.firestore().collection('users').doc(uid).get();
      if (!userDoc.exists) {
        alert('No se encontró información del usuario.');
        firebase.auth().signOut();
        return;
      }
      const role = userDoc.data().role;
  
      // Redirigir según rol
      if (role === 'cliente') {
        window.location.href = 'cliente-dashboard.html';
      } else if (role === 'comerciante') {
        window.location.href = 'comerciante-dashboard.html';
      } else {
        alert('Rol de usuario desconocido.');
        firebase.auth().signOut();
      }
  
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.message);
    }
  });
  function toggleAuthMode(mode) {
    if (mode === 'login') {
      signupButton.style.display = 'none';
      loginButton.style.display = 'block';
    } else {
      signupButton.style.display = 'block';
      loginButton.style.display = 'none';
    }
  }
  
  // Por defecto mostramos solo el loginButton
  toggleAuthMode('login');
  function checkUserRole(user) {
    db.collection("users").doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                const role = doc.data().role;
                userDetails.style.display = "none";

                if (role === "cliente") {
                    clienteDetails.style.display = "block";
                } else if (role === "comerciante") {
                    comercianteDetails.style.display = "block";
                    document.getElementById("fiadoContainer").style.display = "block";
                }
            } else {
                showRoleSelection(user);
            }
        })
        .catch(error => alert("Error al obtener el rol: " + error.message));
}
