import EmployeeForm from "@/components/EmployeeForm";

export default function CreatePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Employee</h1>
      <EmployeeForm />
    </div>
  );
}