import request from "./api";

/* ===================== DASHBOARD ===================== */
export const getDashboard = () =>
  request("/dashboard/");

/* ===================== CHEMICALS ===================== */
export const getChemicals = () =>
  request("/chemicals/");

/* ===================== BATCHES ===================== */
export const getBatches = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/batches/?${query}`);
};

/* ===================== USAGE LOGS ===================== */
export const getUsageLogs = () =>
  request("/usage-logs/");

/* ===================== IN ENTRY ===================== */
/*
Serializer: InEntrySerializer
*/
export const createInEntry = (payload) =>
  request("/in-entry/", {
    method: "POST",
    body: JSON.stringify({
      chemical_name: payload.chemical_name,
      category: payload.category,
      batch_number: payload.batch_number,
      received_date: payload.received_date,
      expiry_date: payload.expiry_date,
      quantity_value: Number(payload.quantity_value),
      quantity_unit: payload.quantity_unit,
      remarks: payload.remarks || "",
    }),
  });

/* ===================== OUT ENTRY ===================== */
/*
Serializer: OutEntrySerializer
*/
export const createOutEntry = (payload) =>
  request("/out-entry/", {
    method: "POST",
    body: JSON.stringify({
      batch_id: Number(payload.batch_id),
      quantity_used: Number(payload.quantity_used),
      usage_date: payload.usage_date,
      purpose: payload.purpose || "",
      remarks: payload.remarks || "",
    }),
  });
