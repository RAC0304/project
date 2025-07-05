import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAndFixDuplicateTourGuides() {
  console.log("🔍 Searching for duplicate tour guide records...");

  try {
    // Get all tour guide records
    const { data: allTourGuides, error: fetchError } = await supabase
      .from("tour_guides")
      .select("id, user_id, bio, location, created_at")
      .order("user_id", { ascending: true })
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("❌ Error fetching tour guides:", fetchError);
      return;
    }

    console.log(`📊 Found ${allTourGuides.length} total tour guide records`);

    // Group by user_id to find duplicates
    const userIdGroups = {};
    allTourGuides.forEach((guide) => {
      if (!userIdGroups[guide.user_id]) {
        userIdGroups[guide.user_id] = [];
      }
      userIdGroups[guide.user_id].push(guide);
    });

    // Find duplicates
    const duplicates = [];
    Object.entries(userIdGroups).forEach(([userId, guides]) => {
      if (guides.length > 1) {
        duplicates.push({ userId, guides });
      }
    });

    if (duplicates.length === 0) {
      console.log("✅ No duplicate tour guide records found!");
      return;
    }

    console.log(
      `🚨 Found ${duplicates.length} users with duplicate tour guide records:`
    );

    for (const { userId, guides } of duplicates) {
      console.log(`\nUser ID: ${userId}`);
      console.log(`Number of records: ${guides.length}`);

      guides.forEach((guide, index) => {
        console.log(
          `  ${index + 1}. ID: ${guide.id}, Created: ${
            guide.created_at
          }, Location: ${guide.location || "N/A"}`
        );
      });

      // Keep the first record (oldest) and mark others for deletion
      const keepRecord = guides[0];
      const deleteRecords = guides.slice(1);

      console.log(`✅ Keeping record ID: ${keepRecord.id} (oldest)`);
      console.log(
        `🗑️  Will delete ${deleteRecords.length} duplicate(s): ${deleteRecords
          .map((r) => r.id)
          .join(", ")}`
      );

      // Check if any of the records to be deleted have related data
      for (const record of deleteRecords) {
        // Check for tours
        const { data: tours, error: toursError } = await supabase
          .from("tours")
          .select("id, title")
          .eq("tour_guide_id", record.id);

        if (toursError) {
          console.error(
            `❌ Error checking tours for record ${record.id}:`,
            toursError
          );
          continue;
        }

        if (tours && tours.length > 0) {
          console.log(
            `⚠️  Record ${record.id} has ${tours.length} tours - will need to reassign these`
          );

          // Reassign tours to the kept record
          const { error: updateError } = await supabase
            .from("tours")
            .update({ tour_guide_id: keepRecord.id })
            .eq("tour_guide_id", record.id);

          if (updateError) {
            console.error(
              `❌ Error reassigning tours for record ${record.id}:`,
              updateError
            );
          } else {
            console.log(
              `✅ Reassigned ${tours.length} tours to record ${keepRecord.id}`
            );
          }
        }

        // Check for reviews
        const { data: reviews, error: reviewsError } = await supabase
          .from("reviews")
          .select("id")
          .eq("tour_guide_id", record.id);

        if (reviewsError) {
          console.error(
            `❌ Error checking reviews for record ${record.id}:`,
            reviewsError
          );
          continue;
        }

        if (reviews && reviews.length > 0) {
          console.log(
            `⚠️  Record ${record.id} has ${reviews.length} reviews - will need to reassign these`
          );

          // Reassign reviews to the kept record
          const { error: updateError } = await supabase
            .from("reviews")
            .update({ tour_guide_id: keepRecord.id })
            .eq("tour_guide_id", record.id);

          if (updateError) {
            console.error(
              `❌ Error reassigning reviews for record ${record.id}:`,
              updateError
            );
          } else {
            console.log(
              `✅ Reassigned ${reviews.length} reviews to record ${keepRecord.id}`
            );
          }
        }
      }

      // Delete the duplicate records
      for (const record of deleteRecords) {
        const { error: deleteError } = await supabase
          .from("tour_guides")
          .delete()
          .eq("id", record.id);

        if (deleteError) {
          console.error(
            `❌ Error deleting duplicate record ${record.id}:`,
            deleteError
          );
        } else {
          console.log(`✅ Deleted duplicate record ${record.id}`);
        }
      }
    }

    console.log("\n🎉 Duplicate cleanup completed!");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Run the function
findAndFixDuplicateTourGuides().then(() => {
  console.log("Script completed.");
  process.exit(0);
});
