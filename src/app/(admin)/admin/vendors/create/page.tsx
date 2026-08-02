"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCreateVendorMutation } from "@/lib/redux/features/vendors/vendorsApi";
import { useGetAdminBrandsQuery } from "@/lib/redux/features/brands/brandsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

export default function CreateVendorPage() {
  const router = useRouter();
  const [createVendor, { isLoading }] = useCreateVendorMutation();
  // Only unassigned brands can be given to a new vendor.
  const { data: brandsData } = useGetAdminBrandsQuery({ ownerId: "null" });
  const allBrands = brandsData?.data ?? [];
  const [error, setError] = useState("");
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    companyName: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleBrand = (brandId: number) =>
    setSelectedBrandIds((ids) =>
      ids.includes(brandId) ? ids.filter((x) => x !== brandId) : [...ids, brandId]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password || !form.companyName) {
      setError("Email, password, and company name are required.");
      return;
    }
    try {
      await createVendor({
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        phone: form.phone || undefined,
        brandIds: selectedBrandIds.length > 0 ? selectedBrandIds : undefined,
      }).unwrap();
      router.push(ROUTES.ADMIN_VENDORS);
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to create vendor.";
      setError(message);
    }
  };

  return (
    <ProtectedRoute requireSuperadmin>
      <div className="max-w-2xl space-y-6">
        <Link
          href={ROUTES.ADMIN_VENDORS}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to vendors
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Add Vendor</CardTitle>
            <CardDescription>
              Creates a vendor account (auto-verified, active). The vendor can log
              in immediately and manage only their own products, brands, and
              discounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company name *</Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={set("companyName")}
                  placeholder="Acme Cosmetics"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="vendor@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">Contact first name</Label>
                  <Input id="firstName" value={form.firstName} onChange={set("firstName")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Contact last name</Label>
                  <Input id="lastName" value={form.lastName} onChange={set("lastName")} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={set("phone")} />
              </div>

              {/* Brand assignment — the vendor can only create products under
                  the brands selected here. */}
              <div className="space-y-1.5">
                <Label>Assigned brands</Label>
                <p className="text-xs text-muted-foreground">
                  The vendor can only add products under the brands you select.
                  You can change this later from the vendor&apos;s page.
                </p>
                {allBrands.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No unassigned brands available. Create a new brand, or free
                    one up from another vendor, then assign it here.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {allBrands.map((brand) => (
                      <label
                        key={brand.id}
                        className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrandIds.includes(brand.id)}
                          onChange={() => toggleBrand(brand.id)}
                        />
                        <span className="text-sm truncate">{brand.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Link href={ROUTES.ADMIN_VENDORS}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Create Vendor
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
