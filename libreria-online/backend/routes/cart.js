// cart.js
const express = require('express');
const router = express.Router();
const conexion = require('../db'); // Asegúrate de que esta ruta sea correcta

// Ruta para agregar un producto al carrito
router.post('/', async (req, res) => {
    const { id_usuario, id_producto, cantidad, precio_unitario, cupon, descuento, envio, id_estado } = req.body;

    const sql = `INSERT INTO carrito_compra (id_usuario, id_producto, cantidad, precio_unitario, cupon, descuento, envio, id_estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [id_usuario, id_producto, cantidad, precio_unitario, cupon, descuento, envio, id_estado];

    try {
        const result = await new Promise((resolve, reject) => {
            conexion.query(sql, values, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
        res.status(201).json({ message: 'Producto agregado al carrito', id_carrito: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta para obtener los productos en el carrito de un usuario
router.get('/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;

    const sql = `SELECT c.id_carrito, c.cantidad, p.nombre_producto, c.precio_unitario, c.cupon, c.descuento, c.envio, c.fecha_agregado
                 FROM carrito_compra c
                 JOIN producto p ON c.id_producto = p.id_producto
                 WHERE c.id_usuario = ?`;
                 
    try {
        const results = await new Promise((resolve, reject) => {
            conexion.query(sql, [id_usuario], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/bulk', async (req, res) => {
    const { id_usuario, productos } = req.body;

    console.log("Recibido id_usuario:", id_usuario);
    console.log("Productos:", productos);

    if (!Array.isArray(productos) || productos.length === 0) {
        return res.status(400).json({ error: 'Se requiere un array de productos' });
    }

    const insertions = [];
    const updates = [];

    for (const producto of productos) {
        const { id_producto, cantidad, precio_unitario, cupon, descuento, envio, id_estado } = producto;

        console.log(`Procesando producto id: ${id_producto}, cantidad: ${cantidad}`);

        const checkSql = `SELECT id_carrito, cantidad FROM carrito_compra WHERE id_usuario = ? AND id_producto = ?`;
        const values = [id_usuario, id_producto];

        const existing = await new Promise((resolve, reject) => {
            conexion.query(checkSql, values, (err, results) => {
                if (err) {
                    console.error("Error al consultar:", err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        if (existing.length > 0) {
            const newCantidad = existing[0].cantidad + cantidad;
            updates.push({ id_carrito: existing[0].id_carrito, cantidad: newCantidad, precio_unitario, cupon, descuento, envio, id_estado });
            console.log(`Producto existente encontrado. Actualizando cantidad a: ${newCantidad}`);
        } else {
            insertions.push({ id_usuario, id_producto, cantidad, precio_unitario, cupon, descuento, envio, id_estado });
            console.log(`Producto no encontrado. Preparando inserción.`);
        }
    }

    // Ejecutar las actualizaciones
    for (const update of updates) {
        const updateSql = `UPDATE carrito_compra SET cantidad = ?, precio_unitario = ?, cupon = ?, descuento = ?, envio = ?, id_estado = ? WHERE id_carrito = ?`;
        const updateValues = [update.cantidad, update.precio_unitario, update.cupon, update.descuento, update.envio, update.id_estado, update.id_carrito];

        await new Promise((resolve, reject) => {
            conexion.query(updateSql, updateValues, (err) => {
                if (err) {
                    console.error("Error al actualizar:", err);
                    return reject(err);
                }
                resolve();
            });
        });
    }

    // Ejecutar las inserciones
    for (const insert of insertions) {
        const insertSql = `INSERT INTO carrito_compra (id_usuario, id_producto, cantidad, precio_unitario, cupon, descuento, envio, id_estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const insertValues = [insert.id_usuario, insert.id_producto, insert.cantidad, insert.precio_unitario, insert.cupon, insert.descuento, insert.envio, insert.id_estado];

        await new Promise((resolve, reject) => {
            conexion.query(insertSql, insertValues, (err) => {
                if (err) {
                    console.error("Error al insertar:", err);
                    return reject(err);
                }
                resolve();
            });
        });
    }

    res.status(201).json({ message: 'Productos agregados al carrito' });
});

// Ruta para calcular el total del carrito
router.get('/total/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;

    const sql = `SELECT SUM(c.cantidad * c.precio_unitario) - SUM(c.descuento) + SUM(c.envio) AS total_carrito
                 FROM carrito_compra c
                 WHERE c.id_usuario = ?`;
                 
    try {
        const result = await new Promise((resolve, reject) => {
            conexion.query(sql, [id_usuario], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results[0].total_carrito || 0); // Asegurarse de que devuelva 0 si no hay resultados
            });
        });
        res.json({ total: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ruta para eliminar un producto del carrito
router.delete('/:id_carrito', async (req, res) => {
    const { id_carrito } = req.params;

    const sql = `DELETE FROM carrito_compra WHERE id_carrito = ?`;

    try {
        const affectedRows = await new Promise((resolve, reject) => {
            conexion.query(sql, [id_carrito], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results.affectedRows);
            });
        });

        if (affectedRows > 0) {
            res.json({ message: 'Producto eliminado del carrito' });
        } else {
            res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Exportar el enrutador
module.exports = router;
