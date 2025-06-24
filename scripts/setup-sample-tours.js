const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  console.error(
    "Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertSampleTours() {
  try {
    console.log("🌟 Adding sample tours for tour guides...");

    // First, let's check if we have any tour guides
    const { data: tourGuides, error: guidesError } = await supabase
      .from("tour_guides")
      .select("id, users(first_name, last_name)")
      .limit(10);

    if (guidesError) {
      console.error("Error fetching tour guides:", guidesError);
      return;
    }

    if (!tourGuides || tourGuides.length === 0) {
      console.log("❌ No tour guides found. Please add tour guides first.");
      return;
    }

    console.log(`✅ Found ${tourGuides.length} tour guides`);

    // Sample tours data
    const sampleTours = [
      {
        title: "Historical City Walking Tour",
        description:
          "Explore the rich history and culture of the city with our expert guide. Visit ancient temples, colonial buildings, and hidden gems.",
        location: "City Center",
        duration: "3 hours",
        price: 45.0,
        max_group_size: 12,
        is_active: true,
      },
      {
        title: "Sunset Beach Adventure",
        description:
          "Experience the most beautiful sunset views while enjoying beach activities and local seafood.",
        location: "Coastal Area",
        duration: "4 hours",
        price: 65.0,
        max_group_size: 8,
        is_active: true,
      },
      {
        title: "Mountain Hiking Experience",
        description:
          "Challenge yourself with a guided mountain hike and enjoy panoramic views from the summit.",
        location: "Mountain Region",
        duration: "6 hours",
        price: 80.0,
        max_group_size: 10,
        is_active: true,
      },
      {
        title: "Cultural Food Tour",
        description:
          "Taste authentic local cuisine and learn about traditional cooking methods from local chefs.",
        location: "Traditional Market",
        duration: "2.5 hours",
        price: 35.0,
        max_group_size: 15,
        is_active: true,
      },
      {
        title: "Photography Adventure",
        description:
          "Capture stunning photos of landscapes and landmarks with professional photography guidance.",
        location: "Various Scenic Spots",
        duration: "5 hours",
        price: 90.0,
        max_group_size: 6,
        is_active: true,
      },
    ];

    let totalToursCreated = 0;

    // Add tours for each tour guide
    for (const guide of tourGuides) {
      console.log(
        `\n📍 Adding tours for ${guide.users?.first_name} ${guide.users?.last_name}...`
      );

      // Randomly select 2-3 tours for each guide
      const numberOfTours = Math.floor(Math.random() * 2) + 2; // 2-3 tours
      const selectedTours = sampleTours
        .sort(() => 0.5 - Math.random())
        .slice(0, numberOfTours);

      for (const tour of selectedTours) {
        const { data, error } = await supabase
          .from("tours")
          .insert([
            {
              tour_guide_id: guide.id,
              ...tour,
            },
          ])
          .select();

        if (error) {
          console.error(
            `❌ Error adding tour "${tour.title}" for guide ${guide.id}:`,
            error
          );
        } else {
          console.log(`✅ Added tour: ${tour.title} ($${tour.price})`);
          totalToursCreated++;
        }
      }
    }

    console.log(`\n🎉 Successfully created ${totalToursCreated} tours!`);
    console.log("\n📋 Summary:");
    console.log(`- Total tour guides: ${tourGuides.length}`);
    console.log(`- Total tours created: ${totalToursCreated}`);
    console.log(
      `- Average tours per guide: ${(
        totalToursCreated / tourGuides.length
      ).toFixed(1)}`
    );
  } catch (error) {
    console.error("❌ Error inserting sample tours:", error);
  }
}

async function checkExistingTours() {
  try {
    console.log("🔍 Checking existing tours...");

    const { data: tours, error } = await supabase
      .from("tours")
      .select(
        `
        id,
        title,
        price,
        tour_guide_id,
        tour_guides (
          users (
            first_name,
            last_name
          )
        )
      `
      )
      .eq("is_active", true);

    if (error) {
      console.error("Error checking tours:", error);
      return;
    }

    if (!tours || tours.length === 0) {
      console.log("📭 No tours found in database.");
      return;
    }

    console.log(`\n📊 Found ${tours.length} active tours:`);
    tours.forEach((tour) => {
      const guideName =
        tour.tour_guides?.users?.first_name +
        " " +
        tour.tour_guides?.users?.last_name;
      console.log(`- ${tour.title} ($${tour.price}) by ${guideName}`);
    });
  } catch (error) {
    console.error("Error checking existing tours:", error);
  }
}

async function main() {
  console.log("🚀 Tour Management Script");
  console.log("========================\n");

  await checkExistingTours();

  console.log("\n" + "=".repeat(50));
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Do you want to add sample tours? (y/n): ", async (answer) => {
    if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
      await insertSampleTours();
      console.log(
        "\n✅ Done! You can now test the BookingModal with available tours."
      );
    } else {
      console.log("👍 Skipped adding sample tours.");
    }
    rl.close();
  });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { insertSampleTours, checkExistingTours };
