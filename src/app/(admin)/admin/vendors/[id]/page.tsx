"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  useGetVendorQuery,
  useUpdateVendorMutation,
  useSetVendorStatusMutation,
  useSetVendorBrandsMutation,
} from "@/lib/redux/features/vendors/vendorsApi";
import { useGetAdminBrandsQuery } from "@/lib/redux/features/brands/brandsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function VendorDetailPage() {
  const params = useParams();
  const id = Number(params?.id);

  const { data: vendor, isLoading } = useGetVendorQuery(id, { skip: !id });
  const { data: brandsData } = useGetAdminBrandsQuery();
  const [updateVendor, { isLoading: isSaving }] = useUpdateVendorMutation();
  const [setStatus, { isLoading: isToggling }] = useSetVendorStatusMutation();
  const [setBrands, { isLoading: isSavingBrands }] = useSetVendorBrandsMutation();

  const [profile, setProfile] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);

  // Hydrate local state once the vendor loads.
  useEffect(() => {
    if (vendor) {
      setProfile({
        companyName: vendor.companyName || "",
        firstName: vendor.firstName || "",
        lastName: vendor.lastName || "",
        phone: vendor.phone || "",
      });
      setSelectedBrandIds((vendor.ownedBrands || []).map((b) => b.id));
    }
  }, [vendor]);

  const allBrands = useMemo(() => brandsData?.data ?? [], [brandsData]);

  const set = (k: keyof typeof profile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((p) => ({ ...p, [k]: e.target.value }));

  const toggleBrand = (brandId: number) =>
    setSelectedBrandIds((ids) =>
      ids.includes(brandId) ? ids.filter((x) => x !== brandId) : [...ids, brandId]
    );

  const saveProfile = () => updateVendor({ id, data: profile });
  const saveBrands = () => setBrands({ id, brandIds: selectedBrandIds });

  return (
    <ProtectedRoute requireSuperadmin>
      <div className="max-w-3xl space-y-6">
        <Link
          href={ROUTES.ADMIN_VENDORS}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to vendors
        </Link>

        {isLoading || !vendor ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Header + status */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {vendor.companyName || vendor.email}
                </h1>
                <p className="text-sm text-muted-foreground">{vendor.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={vendor.isActive ? "default" : "secondary"}>
                  {vendor.isActive ? "Active" : "Deactivated"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isToggling}
                  onClick={() =>
                    setStatus({ id, isActive: !vendor.isActive })
                  }
                >
                  {vendor.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>

            {vendor._count && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{vendor._count.ownedProducts} products</span>
                <span>{vendor._count.ownedBrands} brands</span>
                <span>{vendor._count.ownedDiscounts} discounts</span>
              </div>
            )}

            {/* Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="companyName">Company name</Label>
                  <Input id="companyName" value={profile.companyName} onChange={set("companyName")} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">Contact first name</Label>
                    <Input id="firstName" value={profile.firstName} onChange={set("firstName")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Contact last name</Label>
                    <Input id="lastName" value={profile.lastName} onChange={set("lastName")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={profile.phone} onChange={set("phone")} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={saveProfile} disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Brand ownership */}
            <Card>
              <CardHeader>
                <CardTitle>Brand ownership</CardTitle>
                <CardDescription>
                  Select the brands this vendor owns — only they (and the
                  superadmin) can create products under an owned brand. Checking
                  a brand marked &ldquo;assigned to&rdquo; another vendor will
                  move it to this vendor. Unchecking one leaves it unassigned.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {allBrands.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No brands exist yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allBrands.map((brand) => {
                      const ownedByThisVendor = brand.ownerId === vendor.id;
                      const ownedByOther =
                        brand.ownerId != null && !ownedByThisVendor;
                      const ownerLabel = ownedByOther
                        ? `assigned to ${
                            brand.owner?.companyName ||
                            brand.owner?.firstName ||
                            "another vendor"
                          }`
                        : brand.ownerId == null
                        ? "unassigned"
                        : "";
                      return (
                        <label
                          key={brand.id}
                          className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBrandIds.includes(brand.id)}
                            onChange={() => toggleBrand(brand.id)}
                          />
                          <span className="text-sm truncate">
                            {brand.name}
                            {ownerLabel && (
                              <span
                                className={`ml-1 text-xs ${
                                  ownedByOther
                                    ? "text-amber-600"
                                    : "text-muted-foreground"
                                }`}
                              >
                                ({ownerLabel})
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button onClick={saveBrands} disabled={isSavingBrands}>
                    {isSavingBrands && (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    )}
                    Save Brands
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
