import PinCreationViewContainer from "@/components/PinCreationView/PinCreationViewContainer";
import { ACCESS_TOKEN_COOKIE_KEY } from "@/lib/constants";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const Page = () => {
  const accessTokenCookie = cookies().get(ACCESS_TOKEN_COOKIE_KEY);

  if (!accessTokenCookie) {
    redirect("/");
  }

  return <PinCreationViewContainer />;
};

export default Page;
