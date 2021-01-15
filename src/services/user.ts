
import HttpService from "@/utils/HttpService"
export async function queryMenu(params: number) {
  return HttpService.post("/reportServer/auth/getMenuLisToAntdPro", { userId: params });
}
