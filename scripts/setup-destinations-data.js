import { supabase } from '../src/utils/supabaseClient.js';
import fs from 'fs';
import path from 'path';

async function setupDestinationsData() {
  try {
    console.log('🚀 Setting up destinations data...');

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'database', 'sample_destinations_data.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0 && !statement.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}`);
        
        const { error } = await supabase.rpc('execute_sql', {
          sql_query: statement
        });

        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }

    // Verify the data was inserted
    console.log('🔍 Verifying destinations data...');
    
    const { data: destinations, error: fetchError } = await supabase
      .from('destinations')
      .select('id, slug, name, location')
      .limit(10);

    if (fetchError) {
      console.error('❌ Error fetching destinations:', fetchError);
    } else {
      console.log(`✅ Successfully set up ${destinations?.length || 0} destinations:`);
      destinations?.forEach(dest => {
        console.log(`  - ${dest.name} (${dest.location})`);
      });
    }

    // Check categories
    const { data: categories, error: catError } = await supabase
      .from('destination_categories')
      .select('*')
      .limit(10);

    if (!catError) {
      console.log(`✅ Set up ${categories?.length || 0} destination categories`);
    }

    console.log('🎉 Destinations data setup completed!');

  } catch (error) {
    console.error('❌ Error setting up destinations data:', error);
  }
}

// Alternative method if RPC doesn't work - manual data insertion
async function setupDestinationsDataManual() {
  try {
    console.log('🚀 Setting up destinations data manually...');

    // Sample destinations data
    const destinations = [
      {
        slug: 'bali',
        name: 'Bali',
        location: 'Bali, Indonesia',
        description: 'Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches and coral reefs. The island is home to religious sites such as cliffside Uluwatu Temple.',
        short_description: 'Island of the Gods with pristine beaches, ancient temples, and lush rice terraces',
        image_url: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
        best_time_to_visit: 'April hingga Oktober',
        google_maps_url: 'https://maps.google.com/?q=Bali,Indonesia'
      },
      {
        slug: 'yogyakarta',
        name: 'Yogyakarta',
        location: 'Yogyakarta, Indonesia',
        description: 'Yogyakarta is a city on the Indonesian island of Java known for its traditional arts and cultural heritage. Its Yogyakarta Sultanate palace is a complex of royal buildings.',
        short_description: 'Cultural heart of Java with ancient temples and royal heritage',
        image_url: 'https://images.pexels.com/photos/2413613/pexels-photo-2413613.jpeg',
        best_time_to_visit: 'Mei hingga September',
        google_maps_url: 'https://maps.google.com/?q=Yogyakarta,Indonesia'
      },
      {
        slug: 'raja-ampat',
        name: 'Raja Ampat',
        location: 'Papua Barat, Indonesia',
        description: 'Raja Ampat is an archipelago comprising hundreds of small islands off the northwest tip of Indonesia\'s West Papua province. It\'s known for its marine biodiversity.',
        short_description: 'Paradise for divers with the world\'s richest marine biodiversity',
        image_url: 'https://images.pexels.com/photos/4275885/pexels-photo-4275885.jpeg',
        best_time_to_visit: 'Oktober hingga April',
        google_maps_url: 'https://maps.google.com/?q=Raja+Ampat,Papua+Barat,Indonesia'
      }
    ];

    // Insert destinations
    console.log('📝 Inserting destinations...');
    const { data: insertedDestinations, error: destError } = await supabase
      .from('destinations')
      .insert(destinations)
      .select();

    if (destError) {
      console.error('❌ Error inserting destinations:', destError);
      return;
    }

    console.log(`✅ Inserted ${insertedDestinations?.length || 0} destinations`);

    // Insert categories for each destination
    const categories = [
      { destination_slug: 'bali', categories: ['beach', 'cultural', 'nature'] },
      { destination_slug: 'yogyakarta', categories: ['cultural', 'historical', 'city'] },
      { destination_slug: 'raja-ampat', categories: ['beach', 'nature', 'adventure'] }
    ];

    for (const destCat of categories) {
      const destination = insertedDestinations?.find(d => d.slug === destCat.destination_slug);
      if (destination) {
        const categoryInserts = destCat.categories.map(cat => ({
          destination_id: destination.id,
          category: cat
        }));

        const { error: catError } = await supabase
          .from('destination_categories')
          .insert(categoryInserts);

        if (catError) {
          console.error(`❌ Error inserting categories for ${destCat.destination_slug}:`, catError);
        } else {
          console.log(`✅ Inserted categories for ${destCat.destination_slug}`);
        }
      }
    }

    console.log('🎉 Manual destinations data setup completed!');

  } catch (error) {
    console.error('❌ Error setting up destinations data manually:', error);
  }
}

// Run the setup
if (process.argv.includes('--manual')) {
  setupDestinationsDataManual();
} else {
  setupDestinationsData();
}
