"use client";

import { useState } from "react";
import { db } from "@/lib/firebaseClients"; // ✅ client-side Firestore
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function EmployeeForm() {
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    department: "",
    biometricTemplate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await addDoc(collection(db, "employees"), {
        ...formData,
        ticketBalance: 0,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setFormData({ name: "", employeeId: "", department: "", biometricTemplate: "" });
    } catch (err: any) {
      setError(err.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md shadow-sm">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Employee ID</label>
        <input
          type="text"
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Department</label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Biometric Template</label>
        <input
          type="text"
          name="biometricTemplate"
          value={formData.biometricTemplate}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Employee"}
      </button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {success && <p className="text-green-500 text-sm mt-2">Employee added successfully!</p>}
    </form>
  );
}