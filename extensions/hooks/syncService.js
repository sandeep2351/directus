const { defineHook } = require('@directus/extensions-sdk');
const axios = require('axios');

console.log('Loading SyncService Hook...');

// Initialize the Medusa API client
const medusaAPI = axios.create({
    baseURL: 'http://localhost:9000/app/store',
    headers: { Authorization: `Bearer ${process.env.MEDUSA_API_TOKEN}` },
});

// Log the initialization of the Medusa API client
console.log('Medusa API client initialized with baseURL:', medusaAPI.defaults.baseURL);

async function syncProductToMedusa(product) {
    console.log('Syncing product to Medusa:', product);
    try {
        const response = await medusaAPI.post('/products', {
            title: product.name,
            description: product.description,
            prices: [{ currency_code: 'usd', amount: product.price * 100 }],
            images: product.images || [], // Ensure images is always an array
        });
        console.log('Product successfully synced to Medusa:', response.data);
    } catch (error) {
        console.error('Error syncing product to Medusa:', error.response?.data || error.message);
    }
}

async function updateProductInMedusa(product) {
    console.log('Updating product in Medusa:', product);
    try {
        const response = await medusaAPI.put(`/products/${product.id}`, {
            title: product.name,
            description: product.description,
            prices: [{ currency_code: 'usd', amount: product.price * 100 }],
            images: product.images || [], // Ensure images is always an array
        });
        console.log('Product successfully updated in Medusa:', response.data);
    } catch (error) {
        console.error('Error updating product in Medusa:', error.response?.data || error.message);
    }
}

async function deleteProductFromMedusa(productId) {
    console.log('Deleting product from Medusa with ID:', productId);
    try {
        await medusaAPI.delete(`/products/${productId}`);
        console.log('Product successfully deleted from Medusa');
    } catch (error) {
        console.error('Error deleting product from Medusa:', error.response?.data || error.message);
    }
}

module.exports = defineHook(({ filter, action }) => {
    console.log('SyncService Hook Loaded and Registered');

    action('items.create', async ({ collection, payload }) => {
        console.log('Triggered "items.create" for collection:', collection);
        console.log('Payload received on create:', payload);
        if (collection === 'products') {
            console.log('Creating product in Medusa...');
            await syncProductToMedusa(payload);
        } else {
            console.log('Skipped non-product collection:', collection);
        }
    });

    action('items.update', async ({ collection, payload }) => {
        console.log('Triggered "items.update" for collection:', collection);
        console.log('Payload received on update:', payload);
        if (collection === 'products') {
            console.log('Updating product in Medusa...');
            await updateProductInMedusa(payload);
        } else {
            console.log('Skipped non-product collection:', collection);
        }
    });

    action('items.delete', async ({ collection, payload }) => {
        console.log('Triggered "items.delete" for collection:', collection);
        console.log('Payload received on delete:', payload);
        if (collection === 'products') {
            console.log('Deleting product from Medusa...');
            await deleteProductFromMedusa(payload.id);
        } else {
            console.log('Skipped non-product collection:', collection);
        }
    });
});
