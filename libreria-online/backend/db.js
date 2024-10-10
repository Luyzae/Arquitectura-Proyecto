// db.js
const mysql = require('mysql2');

// Crear una conexión con la base de datos MySQL
const conexion = mysql.createConnection({
  host: '127.0.0.1',    // El host donde está corriendo MySQL
  port: 3306, // Puerto predeterminado de MySQL
  user: 'root',   // El usuario de tu base de datos MySQL 
  password: 'admin', // La contraseña de tu usuario MySQL
  database: 'basedatos' // El nombre de tu base de datos
});

// Conectar a la base de datos
conexion.connect((error) => {
  if (error) {
    console.error('Error al conectar a la base de datos:', error.message);
    return;
  }
  console.log('Conexión exitosa a la base de datos MySQL');
});

// Exportar la conexión para que pueda ser utilizada en otros archivos
module.exports = conexion;
