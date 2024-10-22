// productos.js
const express = require('express');
const router = express.Router();
const conexion = require('./db');  // Importar la conexión de db.js


// Obtener todos los productos
router.get('/products', (req, res) => {
  const sql = 'SELECT * FROM productos';  // Consulta SQL para obtener todos los productos
  conexion.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error al obtener los productos' });
    }
    res.json(results);  // Devolver los resultados en formato JSON
  });
});

// Obtener un producto por su ID
router.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM productos WHERE id = ?';  // Consulta SQL con un parámetro
  conexion.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({ error: 'Error al obtener el producto' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(result[0]);  // Devolver solo el producto encontrado
  });
});

// Crear un nuevo producto
router.post('/products', (req, res) => {
  const { name, img, price } = req.body;  // Obtener datos del cuerpo de la petición
  const sql = 'INSERT INTO productos (name, img, inCart, price) VALUES (?, ?, ?, ?)';
  const values = [name, img, false, price];  // Valores a insertar (inCart por defecto en false)
  
  conexion.query(sql, values, (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error al crear el producto' });
    }
    res.status(201).json({ message: 'Producto creado exitosamente', id: results.insertId });
  });
});

// Actualizar un producto por su ID
router.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, img, inCart, price } = req.body;
  const sql = 'UPDATE productos SET name = ?, img = ?, inCart = ?, price = ? WHERE id = ?';
  const values = [name, img, inCart, price, id];

  conexion.query(sql, values, (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error al actualizar el producto' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto actualizado exitosamente' });
  });
});

// Eliminar un producto por su ID
router.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM productos WHERE id = ?';

  conexion.query(sql, [id], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error al eliminar el producto' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado exitosamente' });
  });
});

module.exports = router;
