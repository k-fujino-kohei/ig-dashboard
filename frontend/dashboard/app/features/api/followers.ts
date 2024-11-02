export type Followers = {
  userid: number;
  username: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  profile_pic_url: string;
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchFollowers = async (accessToken: string) => {
  const response = await fetch(BASE_URL + "/functions/v1/fetchData", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json",
    },
  });

  const { data } = await response.json();
  return data as Followers[];
};
