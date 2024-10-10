const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const db = require('../db');

const router = express.Router();

// Promisify db.query
const dbQuery = (query, params) => new Promise((resolve, reject) => {
  db.query(query, params, (err, results) => {
    if (err) reject(err);
    else resolve(results);
  });
});

// Ruta para registrar usuarios
router.post('/register', [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Debe ser un correo electrónico válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const userExists = await dbQuery('SELECT * FROM usuarios WHERE email_telefono = ?', [email]);
    if (userExists.length > 0) {
      return res.status(400).json({ message: 'El usuario ya está registrado' });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertar el nuevo usuario en la base de datos
    const insertQuery = 'INSERT INTO usuarios (nombre, email_telefono, contraseña, verificado) VALUES (?, ?, ?, 0)';
    await dbQuery(insertQuery, [nombre, email, hashedPassword]);
    
    res.status(201).json({ message: 'Usuario registrado exitosamente' });

  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario', error });
  }
});

module.exports = router;
