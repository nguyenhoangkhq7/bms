export interface Province {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
}

type ProvinceApi = {
  code: number;
  name: string;
};

type ProvinceDetailApi = {
  districts?: Array<{
    code: number;
    name: string;
  }>;
};

const VN_PROVINCE_API_BASE = "https://provinces.open-api.vn/api";

export async function getProvinces(): Promise<Province[]> {
  const res = await fetch(`${VN_PROVINCE_API_BASE}/p/`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Khong the tai danh sach tinh/thanh pho");
  }

  const data = (await res.json()) as ProvinceApi[];
  return data.map((item) => ({ code: item.code, name: item.name }));
}

export async function getDistrictsByProvinceCode(provinceCode: number): Promise<District[]> {
  const res = await fetch(`${VN_PROVINCE_API_BASE}/p/${provinceCode}?depth=2`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Khong the tai danh sach quan/huyen");
  }

  const data = (await res.json()) as ProvinceDetailApi;
  return (data.districts ?? []).map((item) => ({ code: item.code, name: item.name }));
}
