// productos.js
const express = require('express');
const router = express.Router();
const conexion = require('../db');  // Importar la conexión de db.js

// Obtener todos los productos
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM producto'; 
  conexion.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Error al obtener los productos' });
    }
    res.json(results);  
  });
});

// Obtener un producto por su ID
router.get('/:id_producto', (req, res) => {
  const { id_producto } = req.params;
  const sql = 'SELECT * FROM producto WHERE id_producto = ?';  
  conexion.query(sql, [id_producto], (error, result) => {
    if (error) {
      return res.status(500).json({ error: 'Error al obtener el producto' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(result[0]);  
  });
});

// Crear un nuevo producto
router.post('/', (req, res) => {
  const { titulo, imagen_portada, precio, autor, editorial, isbn, stock, descripcion, id_categoria, peso, dimensiones, idioma, anio_edicion, fecha_publicacion } = req.body;

  const sql = 'INSERT INTO producto (titulo, imagen_portada, precio, autor, editorial, isbn, stock, descripcion, id_categoria, peso, dimensiones, idioma, anio_edicion, fecha_publicacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  
  const values = [titulo, imagen_portada, precio, autor, editorial, isbn, stock, descripcion, id_categoria, peso, dimensiones, idioma, anio_edicion, fecha_publicacion];
  
  conexion.query(sql, values, (error, results) => {
    if (error) {
      console.log(error);  
      return res.status(500).json({ error: 'Error al crear el producto' });
    }
    res.status(201).json({ message: 'Producto creado exitosamente', id: results.insertId });
  });
});

// Inserción masiva de productos
router.post('/bulk', (req, res) => {
    const productos = req.body;

    // Validación básica
    if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de productos' });
    }

    const sql = `
        INSERT INTO producto (titulo, imagen_portada, precio, autor, editorial, isbn, stock, descripcion, id_categoria, peso, dimensiones, idioma, anio_edicion, fecha_publicacion) 
        VALUES ?`;

    // Preparar los valores
    const values = productos.map(prod => [
        prod.titulo,
        prod.imagen_portada,
        prod.precio,
        prod.autor,
        prod.editorial,
        prod.isbn,
        prod.stock,
        prod.descripcion,
        prod.id_categoria,
        prod.peso,
        prod.dimensiones,
        prod.idioma,
        prod.anio_edicion,
        prod.fecha_publicacion
    ]);

    conexion.query(sql, [values], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error al agregar los productos', details: error.message });
        }
        res.status(201).json({ message: 'Productos agregados exitosamente', count: results.affectedRows });
    });
});

// Actualizar un producto por su ID
router.put('/:id_producto', (req, res) => {
  const { id_producto } = req.params;
  const { titulo, imagen_portada, precio, autor, editorial, isbn, stock, descripcion, id_categoria, peso, dimensiones, idioma, anio_edicion, fecha_publicacion } = req.body;

  // Validación básica
  if (!titulo || !autor || !precio) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const sql = `
    UPDATE producto 
    SET 
      titulo = ?, 
      imagen_portada = ?, 
      precio = ?, 
      autor = ?, 
      editorial = ?, 
      isbn = ?, 
      stock = ?, 
      descripcion = ?, 
      id_categoria = ?, 
      peso = ?, 
      dimensiones = ?, 
      idioma = ?, 
      anio_edicion = ?, 
      fecha_publicacion = ? 
    WHERE id_producto = ?`;

  const values = [titulo, imagen_portada, precio, autor, editorial, isbn, stock, descripcion, id_categoria, peso, dimensiones, idioma, anio_edicion, fecha_publicacion, id_producto];

  conexion.query(sql, values, (error, results) => {
    if (error) {
      console.error(error); 
      return res.status(500).json({ error: 'Error al actualizar el producto', details: error.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto actualizado exitosamente', id_producto });
  });
});

// Eliminar un producto por su ID
// Agrega aquí la funcionalidad para eliminar un producto si lo necesitas

module.exports = router;
