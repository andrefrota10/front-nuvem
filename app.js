// Substitua o IP abaixo pelo IP público da sua instância AWS
const API_URL = 'http://SEU_IP_PUBLICO_DA_AWS:3000';

const productList = document.querySelector('#products');
const addProductForm = document.querySelector('#add-product-form');
const updateProductForm = document.querySelector('#update-product-form');
const updateProductId = document.querySelector('#update-id');
const updateProductName = document.querySelector('#update-name');
const updateProductDescription = document.querySelector('#update-description');
const updateProductPrice = document.querySelector('#update-price');
const cancelUpdateButton = document.querySelector('#cancel-update');

// Funções de UI
function showUpdateForm(product) {
    updateProductId.value = product.id;
    updateProductName.value = product.name;
    updateProductDescription.value = product.description || '';
    updateProductPrice.value = product.price;
    updateProductForm.style.display = 'block';
}
window.showUpdateForm = showUpdateForm;

function hideUpdateForm() {
    updateProductForm.style.display = 'none';
    updateProductForm.reset();
}
window.hideUpdateForm = hideUpdateForm;

// Comunicação com a API na AWS
async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        productList.innerHTML = '';
        products.forEach(product => {
            const li = document.createElement('li');
            const descText = product.description ? ` | Desc: ${product.description}` : '';
            li.innerHTML = `<strong>ID:</strong> ${product.id} - <strong>${product.name}</strong>${descText} - $${product.price} `;
            
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = 'Delete';
            deleteButton.onclick = async () => { await deleteProduct(product.id); await fetchProducts(); };
            li.appendChild(deleteButton);

            const updateButton = document.createElement('button');
            updateButton.innerHTML = 'Update';
            updateButton.onclick = () => showUpdateForm(product);
            li.appendChild(updateButton);

            productList.appendChild(li);
        });
    } catch (error) { console.error("Erro ao carregar:", error); }
}
window.fetchProducts = fetchProducts;

async function addProduct(name, description, price) {
    const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, price })
    });
    return await response.json();
}

async function updateProduct(id, name, description, price) {
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, price })
    });
    return await response.json();
}

async function deleteProduct(id) {
    const response = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    return await response.json();
}

async function searchProductById() {
    const id = document.getElementById('search-id').value;
    const resultDiv = document.getElementById('search-result');
    const response = await fetch(`${API_URL}/products/${id}`);
    const data = await response.json();
    if (data && data.length > 0) {
        const p = data[0];
        resultDiv.innerHTML = `<p>Encontrado: ${p.name} - $${p.price}</p>`;
    } else {
        resultDiv.innerHTML = `<p>Não encontrado.</p>`;
    }
}
window.searchProductById = searchProductById;

// Listeners
addProductForm.onsubmit = async (e) => {
    e.preventDefault();
    await addProduct(document.getElementById('name').value, document.getElementById('description').value, document.getElementById('price').value);
    addProductForm.reset();
    fetchProducts();
};

updateProductForm.onsubmit = async (e) => {
    e.preventDefault();
    await updateProduct(updateProductId.value, updateProductName.value, updateProductDescription.value, updateProductPrice.value);
    hideUpdateForm();
    fetchProducts();
};

cancelUpdateButton.onclick = hideUpdateForm;

fetchProducts();
