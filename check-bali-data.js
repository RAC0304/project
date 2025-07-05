import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkBaliData() {
  try {
    console.log("Checking Bali destination data...\n");

    // Simulate the same query as in getDestinationById
    const { data, error } = await supabase
      .from("destinations")
      .select(
        `
        *,
        destination_categories(category),
        destination_images(image_url),
        attractions(id, name, description, image_url),
        activities(id, name, description, duration, price, image_url),
        travel_tips(tip)
      `
      )
      .eq("slug", "bali-indonesia")
      .single();

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    console.log("Raw data from database:");
    console.log("- destination_categories:", data.destination_categories);
    console.log(
      "- destination_categories type:",
      typeof data.destination_categories
    );
    console.log(
      "- destination_categories is array:",
      Array.isArray(data.destination_categories)
    );

    // Test the category transformation logic from the service
    const category = (() => {
      // Ensure category is always an array
      if (!data.destination_categories) return [];

      if (Array.isArray(data.destination_categories)) {
        return data.destination_categories
          .map((cat) => cat.category)
          .filter(Boolean);
      }

      // Handle single category object
      if (
        typeof data.destination_categories === "object" &&
        data.destination_categories.category
      ) {
        return [data.destination_categories.category];
      }

      return [];
    })();

    console.log("Transformed category:", category);
    console.log("Category type:", typeof category);
    console.log("Category is array:", Array.isArray(category));

    // Test if the category would cause the React error
    console.log("\n--- Testing React rendering ---");
    if (category && Array.isArray(category) && category.length > 0) {
      console.log(
        "Would render categories:",
        category.map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1))
      );
    } else {
      console.log("No categories to render");
    }
  } catch (err) {
    console.error("Script error:", err);
  }
}

checkBaliData();
