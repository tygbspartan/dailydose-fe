"use client";

import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  useGetVendorsQuery,
  useSetVendorStatusMutation,
} from "@/lib/redux/features/vendors/vendorsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { Plus, Search, Loader2, Store } from "lucide-react";

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const { data: vendors, isLoading } = useGetVendorsQuery(
    search ? { search } : undefined
  );
  const [setStatus, { isLoading: isUpdating }] = useSetVendorStatusMutation();

  return (
    <ProtectedRoute requireSuperadmin>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Store className="h-6 w-6" /> Vendors
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage vendor accounts, activation, and brand ownership.
            </p>
          </div>
          <Link href={`${ROUTES.ADMIN_VENDORS}/create`}>
            <Button>
              <Plus className="h-4 w-4 mr-1" /> Add Vendor
            </Button>
          </Link>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, name, email…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !vendors || vendors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No vendors yet. Add your first vendor to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {vendors.map((v) => (
              <Card key={v.id}>
                <CardHeader className="flex flex-row items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      {v.companyName || v.firstName || v.email}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">
                      {v.email}
                      {v._count
                        ? ` · ${v._count.ownedProducts} products · ${v._count.ownedBrands} brands`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={v.isActive ? "default" : "secondary"}>
                      {v.isActive ? "Active" : "Deactivated"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdating}
                      onClick={() =>
                        setStatus({ id: v.id, isActive: !v.isActive })
                      }
                    >
                      {v.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Link href={`${ROUTES.ADMIN_VENDORS}/${v.id}`}>
                      <Button variant="secondary" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
