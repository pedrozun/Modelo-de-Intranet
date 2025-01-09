import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Plus, Users, X, AlertCircle } from 'lucide-react';
import { getAuthToken } from '../../services/authService';
import { BatchResult } from '../../components/Office/BatchResult';
import { ClientResult } from '../../components/Office/ClientResult';

interface Client {
  Cliente: string;
  NomeFant: string;
}

interface Product {
  Produto: string;
  nome: string;
}

interface BatchResponse {
  message: string;
  batchCode: string;
  clientCode: string;
}

export function OfficePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'client' | 'batch' | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    client: { name: '', acronym: '' },
    batch: { client: '', product: '', quantity: 1 },
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchResponse | null>(null);
  const [clientResult, setClientResult] = useState<string | null>(null);

  useEffect(() => {
    if (modalType === 'batch') {
      fetchClients();
      fetchProducts();
    }
  }, [modalType]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/office/clients', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/office/products', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    }
  };

  const openModal = (type: 'client' | 'batch') => {
    setModalType(type);
    setModalOpen(true);
    setError(null);
    setSuccess(null);
    setBatchResult(null);
    setFormData({
      client: { name: '', acronym: '' },
      batch: { client: '', product: '', quantity: 1 },
    });
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (modalType === 'client') {
      setFormData((prev) => ({
        ...prev,
        client: { ...prev.client, [name]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        batch: { ...prev.batch, [name]: value },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const endpoint =
        modalType === 'client' ? '/api/office/clients' : '/api/office/batches';

      const body = modalType === 'client' ? formData.client : formData.batch;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process request');
      }

      const result = await response.json();
      closeModal(); // Fecha o modal primeiro em ambos os casos

      if (modalType === 'client') {
        setClientResult(formData.client.name);
      } else {
        setBatchResult(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-700 dark:text-white flex items-center gap-2">
          <Users className="h-8 w-8" />
          Sistema de Gerenciamento Microsoft Office
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openModal('batch')}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
        >
          <Plus className="h-8 w-8 mb-4 text-blue-500 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Criar Lotes
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Gere novos lotes de licenças para clientes
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openModal('client')}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
        >
          <Users className="h-8 w-8 mb-4 text-blue-500 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Cadastro de Cliente
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Adicione novos clientes ao sistema
          </p>
        </motion.button>

        <motion.a
          href="https://www.km.srv.br/executavel/versao/OfficeKM_V2.exe"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700"
        >
          <Download className="h-8 w-8 mb-4 text-blue-500 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Download do Instalador
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Baixe a última versão do instalador
          </p>
        </motion.a>
      </div>

      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 top-[-23px] rounded-2xl backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 m-4 max-w-md w-full border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {modalType === 'client' ? 'Cadastrar Cliente' : 'Criar Lote'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalType === 'client' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome do Cliente
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.client.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sigla
                    </label>
                    <input
                      type="text"
                      name="acronym"
                      value={formData.client.acronym}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cliente
                    </label>
                    <select
                      name="client"
                      value={formData.batch.client}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Selecione um cliente</option>
                      {clients.map((client) => (
                        <option key={client.Cliente} value={client.NomeFant}>
                          {client.NomeFant}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Produto
                    </label>
                    <select
                      name="product"
                      value={formData.batch.product}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Selecione um produto</option>
                      {products.map((product) => (
                        <option key={product.Produto} value={product.nome}>
                          {product.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.batch.quantity}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors ${
                    loading
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-blue-600'
                  }`}
                  disabled={loading}
                >
                  {loading
                    ? 'Processando...'
                    : modalType === 'client'
                    ? 'Cadastrar'
                    : 'Criar Lote'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      {clientResult && (
        <ClientResult
          clientName={clientResult}
          onClose={() => {
            setClientResult(null);
          }}
        />
      )}
      {batchResult && (
        <BatchResult
          batchCode={batchResult.batchCode}
          clientCode={batchResult.clientCode}
          onClose={() => {
            setBatchResult(null);
          }}
        />
      )}
    </div>
  );
}
