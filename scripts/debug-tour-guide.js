import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugTourGuideData() {
  try {
    console.log("🔍 Debugging Tour Guide Data...\n");

    // Get all tour guides with their tours
    const { data: tourGuides, error } = await supabase.from("tour_guides")
      .select(`
        id,
        location,
        experience,
        rating,
        review_count,
        availability,
        is_verified,
        users (
          id,
          first_name,
          last_name,
          email,
          profile_picture
        ),
        tour_guide_languages (
          language
        ),
        tours (
          id,
          title,
          description,
          location,
          duration,
          price,
          max_group_size,
          is_active
        )
      `);

    if (error) {
      console.error("❌ Error fetching tour guides:", error);
      return;
    }

    if (!tourGuides || tourGuides.length === 0) {
      console.log("❌ No tour guides found in database");
      return;
    }

    console.log(`✅ Found ${tourGuides.length} tour guides\n`);

    tourGuides.forEach((guide, index) => {
      console.log(`${index + 1}. Tour Guide ID: ${guide.id}`);
      console.log(
        `   Name: ${guide.users?.first_name || "N/A"} ${
          guide.users?.last_name || "N/A"
        }`
      );
      console.log(`   Location: ${guide.location}`);
      console.log(`   Experience: ${guide.experience} years`);
      console.log(
        `   Rating: ${guide.rating}/5 (${guide.review_count} reviews)`
      );
      console.log(`   Verified: ${guide.is_verified ? "Yes" : "No"}`);
      console.log(
        `   Languages: ${
          guide.tour_guide_languages?.map((l) => l.language).join(", ") ||
          "None"
        }`
      );

      if (guide.tours && guide.tours.length > 0) {
        console.log(`   📍 Tours (${guide.tours.length}):`);
        guide.tours.forEach((tour, tourIndex) => {
          console.log(`      ${tourIndex + 1}. ${tour.title}`);
          console.log(`         Duration: ${tour.duration}`);
          console.log(`         Price: $${tour.price}`);
          console.log(`         Max Group: ${tour.max_group_size} people`);
          console.log(`         Active: ${tour.is_active ? "Yes" : "No"}`);
        });
      } else {
        console.log(`   ❌ No tours available`);
      }
      console.log("   " + "-".repeat(50));
    });

    // Test specific tour guide (if ID provided as argument)
    const testId = process.argv[2];
    if (testId) {
      console.log(`\n🔍 Testing specific tour guide ID: ${testId}`);

      const { data: specificGuide, error: specificError } = await supabase
        .from("tour_guides")
        .select(
          `
          *,
          users (
            id,
            email,
            username,
            first_name,
            last_name,
            phone,
            profile_picture
          ),
          tour_guide_languages (
            language
          ),
          tours (
            id,
            title,
            description,
            location,
            duration,
            price,
            max_group_size,
            is_active
          )
        `
        )
        .eq("id", testId)
        .maybeSingle();

      if (specificError) {
        console.error("❌ Error fetching specific guide:", specificError);
      } else if (!specificGuide) {
        console.log("❌ Tour guide not found");
      } else {
        console.log("✅ Guide found:");
        console.log(JSON.stringify(specificGuide, null, 2));
      }
    }
  } catch (error) {
    console.error("❌ Debug error:", error);
  }
}

async function checkTablesStructure() {
  try {
    console.log("\n🗄️ Checking database tables structure...\n");

    // Check tour_guides table
    const { data: guides, error: guidesError } = await supabase
      .from("tour_guides")
      .select("*")
      .limit(1);

    if (guidesError) {
      console.log("❌ tour_guides table:", guidesError.message);
    } else {
      console.log("✅ tour_guides table: accessible");
    }

    // Check tours table
    const { data: tours, error: toursError } = await supabase
      .from("tours")
      .select("*")
      .limit(1);

    if (toursError) {
      console.log("❌ tours table:", toursError.message);
    } else {
      console.log("✅ tours table: accessible");
    }

    // Check users table
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (usersError) {
      console.log("❌ users table:", usersError.message);
    } else {
      console.log("✅ users table: accessible");
    }

    // Check tour_guide_languages table
    const { data: languages, error: languagesError } = await supabase
      .from("tour_guide_languages")
      .select("*")
      .limit(1);

    if (languagesError) {
      console.log("❌ tour_guide_languages table:", languagesError.message);
    } else {
      console.log("✅ tour_guide_languages table: accessible");
    }
  } catch (error) {
    console.error("❌ Structure check error:", error);
  }
}

async function main() {
  console.log("🚀 Tour Guide Data Debug Tool");
  console.log("============================");

  await checkTablesStructure();
  await debugTourGuideData();

  console.log("\n📝 Usage:");
  console.log(
    "- To debug specific guide: node scripts/debug-tour-guide.js [GUIDE_ID]"
  );
  console.log("- To add sample tours: node scripts/setup-sample-tours.js");
}

main().catch(console.error);
