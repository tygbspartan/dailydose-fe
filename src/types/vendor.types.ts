// Vendor (admin) account types — superadmin-managed.

export interface Vendor {
  id: number;
  email: string;
  companyName: string | null;
  logoUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    ownedProducts: number;
    ownedBrands: number;
    ownedDiscounts: number;
  };
}

export interface VendorOwnedBrand {
  id: number;
  name: string;
  slug: string;
}

export interface VendorDetail extends Vendor {
  ownedBrands?: VendorOwnedBrand[];
}

export interface CreateVendorDto {
  email: string;
  password: string;
  companyName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateVendorDto {
  companyName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface VendorFilters {
  isActive?: boolean;
  search?: string;
}

export interface VendorsApiResponse {
  status: string;
  message: string;
  data: Vendor[];
}

export interface SingleVendorApiResponse {
  status: string;
  message: string;
  data: VendorDetail;
}
