import api from "@/lib/api_client";

export const listingService = {
  createListing: (formData: FormData) => {
    return api.post("/listings", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
