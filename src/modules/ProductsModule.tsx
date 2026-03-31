import React, { useEffect, useMemo, useState } from "react";
import { SectionCard } from "../components/SectionCard";
import { money } from "../utils/format";
import { PRODUCTS_STORAGE_KEY } from "../data/storageKeys";
import type { Product, ProductFormState } from "../types/models";

const blankProduct: ProductFormState = {
  id: "",
  partNumber: "",
  shortName: "",
  brand: "",
  model: "",
  costInput: "",
  marginInput: "",
  currency: "MXN",
  description: "",
};

export default function ProductsModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productForm, setProductForm] = useState<ProductFormState>(blankProduct);
  const [editingProductId, setEditingProductId] = useState("");
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!saved) return;
    try {
      setProducts(JSON.parse(saved));
    } catch {
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) =>
      [product.partNumber, product.shortName, product.brand, product.model, product.description]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [products, productSearch]);

  const productCostNumber = useMemo(
    () => Number(productForm.costInput || 0),
    [productForm.costInput]
  );

  const productMarginNumber = useMemo(
    () => Number(productForm.marginInput || 0),
    [productForm.marginInput]
  );

  const productSalePrice = useMemo(() => {
    if (!productCostNumber) return 0;
    const marginDecimal = productMarginNumber / 100;
    if (marginDecimal >= 1) return 0;
    return productCostNumber / (1 - marginDecimal);
  }, [productCostNumber, productMarginNumber]);

  function resetProductForm() {
    setProductForm(blankProduct);
    setEditingProductId("");
  }

  function saveProduct() {
    if (!productForm.partNumber.trim() || !productForm.shortName.trim()) {
      alert("Captura al menos número de parte y nombre corto.");
      return;
    }

    if (Number(productForm.marginInput || 0) >= 100) {
      alert("El margen de ganancia debe ser menor a 100%.");
      return;
    }

    const payload: Product = {
      id: editingProductId || crypto.randomUUID(),
      partNumber: productForm.partNumber.trim(),
      shortName: productForm.shortName.trim(),
      brand: productForm.brand.trim(),
      model: productForm.model.trim(),
      cost: Number(productForm.costInput || 0),
      marginPercent: Number(productForm.marginInput || 0),
      salePrice: productSalePrice,
      currency: productForm.currency,
      description: productForm.description.trim(),
    };

    if (editingProductId) {
      setProducts((prev) =>
        prev.map((item) => (item.id === editingProductId ? payload : item))
      );
    } else {
      setProducts((prev) => [...prev, payload]);
    }

    resetProductForm();
  }

  function editProduct(product: Product) {
    setProductForm({
      id: product.id,
      partNumber: product.partNumber,
      shortName: product.shortName,
      brand: product.brand,
      model: product.model,
      costInput: String(product.cost),
      marginInput: String(product.marginPercent),
      currency: product.currency,
      description: product.description,
    });
    setEditingProductId(product.id);
  }

  function deleteProduct(id: string) {
    const confirmed = window.confirm("¿Deseas eliminar este producto?");
    if (!confirmed) return;
    setProducts((prev) => prev.filter((item) => item.id !== id));
    if (editingProductId === id) resetProductForm();
  }

  return (
    <div className="content-stack">
      <SectionCard
        title={editingProductId ? "Editar producto" : "Alta de producto"}
        right={
          <button className="btn btn-secondary" onClick={resetProductForm}>
            Limpiar
          </button>
        }
      >
        <div className="form-grid">
          <div className="field">
            <label>Número de parte</label>
            <input
              value={productForm.partNumber}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, partNumber: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Nombre corto</label>
            <input
              value={productForm.shortName}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, shortName: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Marca</label>
            <input
              value={productForm.brand}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, brand: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Modelo</label>
            <input
              value={productForm.model}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, model: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Moneda</label>
            <select
              value={productForm.currency}
              onChange={(e) =>
                setProductForm((prev) => ({
                  ...prev,
                  currency: e.target.value as "MXN" | "USD",
                }))
              }
            >
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="field">
            <label>Costo</label>
            <input
              type="number"
              value={productForm.costInput}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, costInput: e.target.value }))
              }
            />
          </div>

          <div className="field">
            <label>Margen de ganancia %</label>
            <input
              type="number"
              value={productForm.marginInput}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, marginInput: e.target.value }))
              }
            />
          </div>

          <div className="info-box">
            <div className="info-box-label">Precio de venta</div>
            <div className="info-box-value">{money(productSalePrice, productForm.currency)}</div>
          </div>

          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Descripción</label>
            <textarea
              value={productForm.description}
              onChange={(e) =>
                setProductForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="button-row">
          <button className="btn btn-primary" onClick={saveProduct}>
            {editingProductId ? "Guardar cambios" : "Agregar producto"}
          </button>
          <button className="btn btn-secondary" onClick={resetProductForm}>
            Cancelar
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Catálogo de productos">
        <div className="search-box">
          <div className="field">
            <label>Buscar</label>
            <input
              value={productSearch}
              placeholder="Buscar por parte, nombre, marca o modelo"
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>No. parte</th>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Costo</th>
                <th>Margen %</th>
                <th>Precio de venta</th>
                <th>Moneda</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-state">
                    Todavía no hay productos registrados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.partNumber}</td>
                    <td>{product.shortName}</td>
                    <td>{product.brand}</td>
                    <td>{product.model}</td>
                    <td>{money(product.cost, product.currency)}</td>
                    <td>{product.marginPercent.toFixed(2)}%</td>
                    <td>{money(product.salePrice, product.currency)}</td>
                    <td>{product.currency}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary" onClick={() => editProduct(product)}>
                          Editar
                        </button>
                        <button
                          className="btn btn-secondary btn-danger"
                          onClick={() => deleteProduct(product.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
