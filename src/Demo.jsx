import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, AlertCircle, Package, TrendingDown, Calendar, Edit2, Trash2, Eye } from 'lucide-react';

const LabInventorySystemDemo = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chemicals, setChemicals] = useState([]);
  const [batches, setBatches] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUnit, setFilterUnit] = useState('all');
  const [showInModal, setShowInModal] = useState(false);
  const [showOutModal, setShowOutModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // IN Entry Form State
  const [inForm, setInForm] = useState({
    chemical_name: '',
    category: '',
    batch_number: '',
    received_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    quantity_value: '',
    quantity_unit: 'ml',
    remarks: ''
  });

  // OUT Entry Form State
  const [outForm, setOutForm] = useState({
    selected_batch_id: '',
    quantity_used: '',
    usage_date: new Date().toISOString().split('T')[0],
    purpose: '',
    remarks: ''
  });

  // Calculate expiry status
  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { status: 'expired', color: 'bg-gray-400', text: 'Expired', days: daysLeft };
    if (daysLeft < 7) return { status: 'red', color: 'bg-red-500', text: 'Critical', days: daysLeft };
    if (daysLeft < 15) return { status: 'orange', color: 'bg-orange-500', text: 'Use Priority', days: daysLeft };
    if (daysLeft < 31) return { status: 'yellow', color: 'bg-yellow-500', text: 'Approaching', days: daysLeft };
    return { status: 'green', color: 'bg-green-500', text: 'Safe', days: daysLeft };
  };

  // Handle IN Entry
  const handleInEntry = () => {
    const newChemical = {
      chemical_id: Date.now().toString(),
      chemical_name: inForm.chemical_name,
      category: inForm.category,
      remarks: inForm.remarks
    };

    const newBatch = {
      batch_id: `${Date.now()}-batch`,
      chemical_id: newChemical.chemical_id,
      chemical_name: inForm.chemical_name,
      category: inForm.category,
      batch_number: inForm.batch_number,
      received_date: inForm.received_date,
      expiry_date: inForm.expiry_date,
      initial_quantity: parseFloat(inForm.quantity_value),
      current_balance: parseFloat(inForm.quantity_value),
      quantity_unit: inForm.quantity_unit,
      remarks: inForm.remarks
    };

    setChemicals([...chemicals, newChemical]);
    setBatches([...batches, newBatch]);
    setShowInModal(false);
    setInForm({
      chemical_name: '',
      category: '',
      batch_number: '',
      received_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      quantity_value: '',
      quantity_unit: 'ml',
      remarks: ''
    });
  };

  // Get batches sorted by expiry date
  const getAvailableBatches = () => {
    return batches
      .filter(b => b.current_balance > 0)
      .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  };

  // Handle OUT Entry
  const handleOutEntry = () => {
    const batch = batches.find(b => b.batch_id === outForm.selected_batch_id);
    if (!batch) return;

    const quantityUsed = parseFloat(outForm.quantity_used);
    if (quantityUsed > batch.current_balance) {
      alert('Quantity exceeds available balance!');
      return;
    }

    const newUsageLog = {
      usage_id: Date.now().toString(),
      chemical_id: batch.chemical_id,
      batch_id: batch.batch_id,
      chemical_name: batch.chemical_name,
      batch_number: batch.batch_number,
      usage_date: outForm.usage_date,
      quantity_used: quantityUsed,
      quantity_unit: batch.quantity_unit,
      purpose: outForm.purpose,
      remarks: outForm.remarks
    };

    const updatedBatches = batches.map(b => {
      if (b.batch_id === batch.batch_id) {
        return { ...b, current_balance: b.current_balance - quantityUsed };
      }
      return b;
    });

    setBatches(updatedBatches);
    setUsageLogs([...usageLogs, newUsageLog]);
    setShowOutModal(false);
    setOutForm({
      selected_batch_id: '',
      quantity_used: '',
      usage_date: new Date().toISOString().split('T')[0],
      purpose: '',
      remarks: ''
    });
  };

  // Filter and search batches
  const filteredBatches = useMemo(() => {
    let result = batches;

    // Search filter
    if (searchTerm) {
      result = result.filter(b => 
        b.chemical_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(b => getExpiryStatus(b.expiry_date).status === filterStatus);
    }

    // Unit filter
    if (filterUnit !== 'all') {
      result = result.filter(b => b.quantity_unit === filterUnit);
    }

    return result.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  }, [batches, searchTerm, filterStatus, filterUnit]);

  // Dashboard statistics
  const stats = useMemo(() => {
    const statusCounts = { green: 0, yellow: 0, orange: 0, red: 0, expired: 0 };
    batches.forEach(b => {
      const status = getExpiryStatus(b.expiry_date).status;
      statusCounts[status]++;
    });

    const lowStock = batches.filter(b => 
      b.current_balance < b.initial_quantity * 0.3 && b.current_balance > 0
    );

    return { statusCounts, lowStock, totalBatches: batches.length };
  }, [batches]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lab Chemical Inventory</h1>
              <p className="text-sm text-gray-600 mt-1">Expiry Management System</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowInModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                IN Entry
              </button>
              <button
                onClick={() => setShowOutModal(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <TrendingDown size={20} />
                OUT Entry
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            {['dashboard', 'all_chemicals', 'expiring_soon', 'expired', 'usage_history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Safe</span>
                </div>
                <div className="text-2xl font-bold">{stats.statusCounts.green}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Approaching</span>
                </div>
                <div className="text-2xl font-bold">{stats.statusCounts.yellow}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Priority</span>
                </div>
                <div className="text-2xl font-bold">{stats.statusCounts.orange}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Critical</span>
                </div>
                <div className="text-2xl font-bold">{stats.statusCounts.red}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-600">Expired</span>
                </div>
                <div className="text-2xl font-bold">{stats.statusCounts.expired}</div>
              </div>
            </div>

            {/* Low Stock Alert */}
            {stats.lowStock.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="text-orange-600" size={20} />
                  <h3 className="font-semibold text-orange-900">Low Stock Alert</h3>
                </div>
                <div className="space-y-2">
                  {stats.lowStock.slice(0, 5).map(batch => (
                    <div key={batch.batch_id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{batch.chemical_name} ({batch.batch_number})</span>
                      <span className="font-medium text-orange-700">
                        {batch.current_balance} {batch.quantity_unit} remaining
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recently Used */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Recently Used Chemicals</h3>
              <div className="space-y-3">
                {usageLogs.slice(-5).reverse().map(log => (
                  <div key={log.usage_id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <div className="font-medium text-gray-900">{log.chemical_name}</div>
                      <div className="text-sm text-gray-600">Batch: {log.batch_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{log.quantity_used} {log.quantity_unit}</div>
                      <div className="text-sm text-gray-600">{log.usage_date}</div>
                    </div>
                  </div>
                ))}
                {usageLogs.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No usage history yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'all_chemicals' || activeTab === 'expiring_soon' || activeTab === 'expired') && (
          <div>
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by chemical name, batch number, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="green">Safe</option>
                  <option value="yellow">Approaching</option>
                  <option value="orange">Priority</option>
                  <option value="red">Critical</option>
                  <option value="expired">Expired</option>
                </select>
                <select
                  value={filterUnit}
                  onChange={(e) => setFilterUnit(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Units</option>
                  <option value="ml">ml</option>
                  <option value="L">L</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
            </div>

            {/* Chemicals Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chemical</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredBatches
                      .filter(b => {
                        if (activeTab === 'expiring_soon') {
                          const status = getExpiryStatus(b.expiry_date).status;
                          return status === 'yellow' || status === 'orange' || status === 'red';
                        }
                        if (activeTab === 'expired') {
                          return getExpiryStatus(b.expiry_date).status === 'expired';
                        }
                        return true;
                      })
                      .map(batch => {
                        const expiryInfo = getExpiryStatus(batch.expiry_date);
                        const stockPercent = (batch.current_balance / batch.initial_quantity) * 100;
                        return (
                          <tr key={batch.batch_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 ${expiryInfo.color} rounded-full`}></div>
                                <span className="text-xs font-medium">{expiryInfo.text}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{batch.chemical_name}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{batch.category}</td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{batch.batch_number}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{batch.expiry_date}</td>
                            <td className="px-4 py-3">
                              <span className={`text-sm font-medium ${
                                expiryInfo.days < 0 ? 'text-gray-500' :
                                expiryInfo.days < 7 ? 'text-red-600' :
                                expiryInfo.days < 15 ? 'text-orange-600' :
                                expiryInfo.days < 31 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {expiryInfo.days < 0 ? `${Math.abs(expiryInfo.days)} days ago` : `${expiryInfo.days} days`}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{batch.current_balance} {batch.quantity_unit}</span>
                                {stockPercent < 30 && stockPercent > 0 && (
                                  <span className="text-xs text-orange-600">(Low)</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  setSelectedBatch(batch);
                                  setShowDetailsModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {filteredBatches.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No chemicals found matching your criteria
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage_history' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Usage History Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chemical</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Used</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {usageLogs.slice().reverse().map(log => (
                    <tr key={log.usage_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{log.usage_date}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{log.chemical_name}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{log.batch_number}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.quantity_used} {log.quantity_unit}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.purpose || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usageLogs.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No usage history recorded yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* IN Entry Modal */}
      {showInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">IN Entry - Add New Chemical Batch</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chemical Name *</label>
                <input
                  type="text"
                  value={inForm.chemical_name}
                  onChange={(e) => setInForm({...inForm, chemical_name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sodium Hydroxide"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  value={inForm.category}
                  onChange={(e) => setInForm({...inForm, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Base, Acid, Solvent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number *</label>
                <input
                  type="text"
                  value={inForm.batch_number}
                  onChange={(e) => setInForm({...inForm, batch_number: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., BTH-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Received Date *</label>
                <input
                  type="date"
                  value={inForm.received_date}
                  onChange={(e) => setInForm({...inForm, received_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  value={inForm.expiry_date}
                  onChange={(e) => setInForm({...inForm, expiry_date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inForm.quantity_value}
                    onChange={(e) => setInForm({...inForm, quantity_value: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                  <select
                    value={inForm.quantity_unit}
                    onChange={(e) => setInForm({...inForm, quantity_unit: e.target.value})}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={inForm.remarks}
                  onChange={(e) => setInForm({...inForm, remarks: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowInModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInEntry}
                disabled={!inForm.chemical_name || !inForm.category || !inForm.batch_number || !inForm.expiry_date || !inForm.quantity_value}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add to Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OUT Entry Modal */}
      {showOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">OUT Entry - Log Chemical Usage</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch (FIFO by Expiry) *</label>
                <select
                  value={outForm.selected_batch_id}
                  onChange={(e) => setOutForm({...outForm, selected_batch_id: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select a batch --</option>
                  {getAvailableBatches().map(batch => {
                    const expiryInfo = getExpiryStatus(batch.expiry_date);
                    return (
                      <option key={batch.batch_id} value={batch.batch_id}>
                        {batch.chemical_name} | Batch: {batch.batch_number} | Expires: {batch.expiry_date} ({expiryInfo.days} days) | Available: {batch.current_balance} {batch.quantity_unit}
                      </option>
                    );
                  })}
                </select>
              </div>
              {outForm.selected_batch_id && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Used *</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={outForm.quantity_used}
                        onChange={(e) => setOutForm({...outForm, quantity_used: e.target.value})}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="10"
                      />
                      <div className="px-3 py-2 bg-gray-100 border rounded-lg">
                        {batches.find(b => b.batch_id === outForm.selected_batch_id)?.quantity_unit}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usage Date *</label>
                    <input
                      type="date"
                      value={outForm.usage_date}
                      onChange={(e) => setOutForm({...outForm, usage_date: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                    <input
                      type="text"
                      value={outForm.purpose}
                      onChange={(e) => setOutForm({...outForm, purpose: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Titration experiment, pH adjustment"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <textarea
                      value={outForm.remarks}
                      onChange={(e) => setOutForm({...outForm, remarks: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Optional notes..."
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowOutModal(false);
                  setOutForm({
                    selected_batch_id: '',
                    quantity_used: '',
                    usage_date: new Date().toISOString().split('T')[0],
                    purpose: '',
                    remarks: ''
                  });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleOutEntry}
                disabled={!outForm.selected_batch_id || !outForm.quantity_used}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Record Usage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Details Modal */}
      {showDetailsModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Batch Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">Chemical Name</span>
                <p className="font-medium text-gray-900">{selectedBatch.chemical_name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Category</span>
                <p className="font-medium text-gray-900">{selectedBatch.category}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Batch Number</span>
                <p className="font-medium font-mono text-gray-900">{selectedBatch.batch_number}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Received Date</span>
                <p className="font-medium text-gray-900">{selectedBatch.received_date}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Expiry Date</span>
                <p className="font-medium text-gray-900">{selectedBatch.expiry_date}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Days Until Expiry</span>
                <p className={`font-medium ${
                  getExpiryStatus(selectedBatch.expiry_date).days < 0 ? 'text-gray-500' :
                  getExpiryStatus(selectedBatch.expiry_date).days < 7 ? 'text-red-600' :
                  getExpiryStatus(selectedBatch.expiry_date).days < 15 ? 'text-orange-600' :
                  getExpiryStatus(selectedBatch.expiry_date).days < 31 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {getExpiryStatus(selectedBatch.expiry_date).days} days
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Initial Quantity</span>
                <p className="font-medium text-gray-900">{selectedBatch.initial_quantity} {selectedBatch.quantity_unit}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Current Balance</span>
                <p className="font-medium text-gray-900">{selectedBatch.current_balance} {selectedBatch.quantity_unit}</p>
              </div>
              {selectedBatch.remarks && (
                <div className="col-span-2">
                  <span className="text-sm text-gray-600">Remarks</span>
                  <p className="font-medium text-gray-900">{selectedBatch.remarks}</p>
                </div>
              )}
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-3 mt-6">Usage History for this Batch</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              {usageLogs.filter(log => log.batch_id === selectedBatch.batch_id).length > 0 ? (
                <div className="space-y-2">
                  {usageLogs.filter(log => log.batch_id === selectedBatch.batch_id).map(log => (
                    <div key={log.usage_id} className="bg-white p-3 rounded border">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-900">{log.quantity_used} {log.quantity_unit}</span>
                        <span className="text-sm text-gray-600">{log.usage_date}</span>
                      </div>
                      {log.purpose && <p className="text-sm text-gray-600">Purpose: {log.purpose}</p>}
                      {log.remarks && <p className="text-sm text-gray-500">Remarks: {log.remarks}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No usage recorded for this batch yet</p>
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedBatch(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabInventorySystemDemo;

