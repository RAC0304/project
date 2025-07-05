-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activities (
  id bigint NOT NULL DEFAULT nextval('activities_id_seq'::regclass),
  destination_id bigint NOT NULL,
  name character varying NOT NULL,
  description text NOT NULL,
  duration character varying,
  price character varying,
  image_url character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT activities_pkey PRIMARY KEY (id),
  CONSTRAINT activities_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id)
);
CREATE TABLE public.attractions (
  id bigint NOT NULL DEFAULT nextval('attractions_id_seq'::regclass),
  destination_id bigint NOT NULL,
  name character varying NOT NULL,
  description text NOT NULL,
  image_url character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT attractions_pkey PRIMARY KEY (id),
  CONSTRAINT attractions_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id)
);
CREATE TABLE public.bookings (
  id bigint NOT NULL DEFAULT nextval('bookings_id_seq'::regclass),
  tour_id bigint NOT NULL,
  user_id bigint NOT NULL,
  date date NOT NULL,
  participants integer NOT NULL,
  status USER-DEFINED DEFAULT 'pending'::booking_status,
  special_requests text,
  total_amount numeric NOT NULL,
  payment_status USER-DEFINED DEFAULT 'pending'::payment_status,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  amount integer,
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT bookings_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id)
);
CREATE TABLE public.cultural_insights (
  id bigint NOT NULL DEFAULT nextval('cultural_insights_id_seq'::regclass),
  destination_id bigint NOT NULL,
  title character varying NOT NULL,
  content text NOT NULL,
  image_url character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT cultural_insights_pkey PRIMARY KEY (id),
  CONSTRAINT cultural_insights_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id)
);
CREATE TABLE public.destination_categories (
  id bigint NOT NULL DEFAULT nextval('destination_categories_id_seq'::regclass),
  destination_id bigint NOT NULL,
  category character varying NOT NULL,
  CONSTRAINT destination_categories_pkey PRIMARY KEY (id),
  CONSTRAINT destination_categories_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id)
);
CREATE TABLE public.destination_images (
  id bigint NOT NULL DEFAULT nextval('destination_images_id_seq'::regclass),
  destination_id bigint NOT NULL,
  image_url character varying NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT destination_images_pkey PRIMARY KEY (id),
  CONSTRAINT destination_images_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id)
);
CREATE TABLE public.destinations (
  id bigint NOT NULL DEFAULT nextval('destinations_id_seq'::regclass),
  slug character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  location character varying NOT NULL,
  description text NOT NULL,
  short_description text,
  image_url character varying,
  best_time_to_visit character varying,
  google_maps_url text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT destinations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.itineraries (
  id bigint NOT NULL DEFAULT nextval('itineraries_id_seq'::regclass),
  slug character varying NOT NULL UNIQUE,
  title character varying NOT NULL,
  duration character varying NOT NULL,
  description text NOT NULL,
  image_url character varying,
  difficulty character varying,
  best_season character varying,
  estimated_budget character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  category character varying DEFAULT 'cultural'::character varying,
  status character varying DEFAULT 'published'::character varying,
  featured boolean DEFAULT false,
  min_participants integer DEFAULT 1,
  max_participants integer DEFAULT 20,
  created_by bigint,
  CONSTRAINT itineraries_pkey PRIMARY KEY (id),
  CONSTRAINT itineraries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.itinerary_activities (
  id bigint NOT NULL DEFAULT nextval('itinerary_activities_id_seq'::regclass),
  itinerary_day_id bigint NOT NULL,
  time_start character varying NOT NULL,
  title character varying NOT NULL,
  description text NOT NULL,
  location character varying,
  duration_minutes integer,
  optional boolean DEFAULT false,
  order_index integer DEFAULT 1,
  CONSTRAINT itinerary_activities_pkey PRIMARY KEY (id),
  CONSTRAINT itinerary_activities_itinerary_day_id_fkey FOREIGN KEY (itinerary_day_id) REFERENCES public.itinerary_days(id)
);
CREATE TABLE public.itinerary_bookings (
  id bigint NOT NULL DEFAULT nextval('itinerary_bookings_id_seq'::regclass),
  itinerary_id bigint,
  user_id bigint,
  tour_guide_id bigint,
  participants integer NOT NULL DEFAULT 1,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_price numeric,
  currency character varying DEFAULT 'USD'::character varying,
  status character varying NOT NULL DEFAULT 'pending'::character varying,
  special_requests text,
  contact_email character varying,
  contact_phone character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT itinerary_bookings_pkey PRIMARY KEY (id),
  CONSTRAINT itinerary_bookings_itinerary_id_fkey FOREIGN KEY (itinerary_id) REFERENCES public.itineraries(id),
  CONSTRAINT itinerary_bookings_tour_guide_id_fkey FOREIGN KEY (tour_guide_id) REFERENCES public.tour_guides(id),
  CONSTRAINT itinerary_bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.itinerary_days (
  id bigint NOT NULL DEFAULT nextval('itinerary_days_id_seq'::regclass),
  itinerary_id bigint NOT NULL,
  day_number integer NOT NULL,
  title character varying NOT NULL,
  description text NOT NULL,
  accommodation character varying,
  meals character varying,
  transportation character varying,
  CONSTRAINT itinerary_days_pkey PRIMARY KEY (id),
  CONSTRAINT itinerary_days_itinerary_id_fkey FOREIGN KEY (itinerary_id) REFERENCES public.itineraries(id)
);
CREATE TABLE public.itinerary_destinations (
  id bigint NOT NULL DEFAULT nextval('itinerary_destinations_id_seq'::regclass),
  itinerary_id bigint NOT NULL,
  destination_id bigint NOT NULL,
  order_index integer DEFAULT 1,
  CONSTRAINT itinerary_destinations_pkey PRIMARY KEY (id),
  CONSTRAINT itinerary_destinations_itinerary_id_fkey FOREIGN KEY (itinerary_id) REFERENCES public.itineraries(id),
  CONSTRAINT itinerary_destinations_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id)
);
CREATE TABLE public.itinerary_images (
  id bigint NOT NULL DEFAULT nextval('itinerary_images_id_seq'::regclass),
  itinerary_id bigint,
  image_url character varying NOT NULL,
  alt_text character varying,
  caption text,
  order_index integer NOT NULL DEFAULT 1,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT itinerary_images_pkey PRIMARY KEY (id),
  CONSTRAINT itinerary_images_itinerary_id_fkey FOREIGN KEY (itinerary_id) REFERENCES public.itineraries(id)
);
CREATE TABLE public.itinerary_requests (
  id bigint NOT NULL DEFAULT nextval('itinerary_requests_id_seq'::regclass),
  user_id bigint NOT NULL,
  itinerary_id bigint NOT NULL,
  tour_guide_id bigint,
  name character varying NOT NULL,
  email character varying NOT NULL,
  phone character varying,
  start_date date NOT NULL,
  end_date date NOT NULL,
  group_size character varying NOT NULL,
  additional_requests text,
  status USER-DEFINED DEFAULT 'pending'::request_status,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT itinerary_requests_pkey PRIMARY KEY (id),
  CONSTRAINT itinerary_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT itinerary_requests_tour_guide_id_fkey FOREIGN KEY (tour_guide_id) REFERENCES public.tour_guides(id),
  CONSTRAINT itinerary_requests_itinerary_id_fkey FOREIGN KEY (itinerary_id) REFERENCES public.itineraries(id)
);
CREATE TABLE public.itinerary_reviews (
  id bigint NOT NULL DEFAULT nextval('itinerary_reviews_id_seq'::regclass),
  itinerary_id bigint,
  user_id bigint,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  helpful_count integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT itinerary_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT itinerary_reviews_itinerary_id_fkey FOREIGN KEY (itinerary_id) REFERENCES public.itineraries(id),
  CONSTRAINT itinerary_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.itinerary_tag_relations (
  id bigint NOT NULL DEFAULT nextval('itinerary_tag_relations_id_seq'::regclass),
  itinerary_id bigint,
  tag_id bigint,
  CONSTRAINT itinerary_tag_relations_pkey PRIMARY KEY (id),
  CONSTRAINT itinerary_tag_relations_itinerary_id_fkey FOREIGN KEY (itinerary_id) REFERENCES public.itineraries(id),
  CONSTRAINT itinerary_tag_relations_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.itinerary_tags(id)
);
CREATE TABLE public.itinerary_tags (
  id bigint NOT NULL DEFAULT nextval('itinerary_tags_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT itinerary_tags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.messages (
  id bigint NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
  sender_id bigint NOT NULL,
  receiver_id bigint NOT NULL,
  tour_guide_id bigint,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  attachment_url text,
  attachment_name text,
  attachment_size integer,
  attachment_type text,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_tour_guide_id_fkey FOREIGN KEY (tour_guide_id) REFERENCES public.tour_guides(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id)
);
CREATE TABLE public.payments (
  id bigint NOT NULL DEFAULT nextval('payments_id_seq'::regclass),
  booking_id bigint NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  payment_method USER-DEFINED NOT NULL,
  transaction_id character varying NOT NULL UNIQUE,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::payment_status_enum,
  gateway_response jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);
CREATE TABLE public.review_images (
  id bigint NOT NULL DEFAULT nextval('review_images_id_seq'::regclass),
  review_id bigint NOT NULL,
  image_url character varying NOT NULL,
  CONSTRAINT review_images_pkey PRIMARY KEY (id),
  CONSTRAINT review_images_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id)
);
CREATE TABLE public.review_responses (
  id bigint NOT NULL DEFAULT nextval('review_responses_id_seq'::regclass),
  review_id bigint NOT NULL,
  user_id bigint NOT NULL,
  response text NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT review_responses_pkey PRIMARY KEY (id),
  CONSTRAINT review_responses_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id),
  CONSTRAINT review_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.review_tags (
  id bigint NOT NULL DEFAULT nextval('review_tags_id_seq'::regclass),
  review_id bigint NOT NULL,
  tag character varying NOT NULL,
  CONSTRAINT review_tags_pkey PRIMARY KEY (id),
  CONSTRAINT review_tags_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.reviews(id)
);
CREATE TABLE public.reviews (
  id bigint NOT NULL DEFAULT nextval('reviews_id_seq'::regclass),
  user_id bigint NOT NULL,
  booking_id bigint,
  destination_id bigint,
  tour_guide_id bigint,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title character varying NOT NULL,
  content text NOT NULL,
  helpful_count integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_tour_guide_id_fkey FOREIGN KEY (tour_guide_id) REFERENCES public.tour_guides(id),
  CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT reviews_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id)
);
CREATE TABLE public.security_logs (
  id bigint NOT NULL DEFAULT nextval('security_logs_id_seq'::regclass),
  user_id bigint,
  action character varying NOT NULL,
  ip_address character varying NOT NULL,
  user_agent text NOT NULL,
  status USER-DEFINED DEFAULT 'success'::security_status,
  details text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT security_logs_pkey PRIMARY KEY (id),
  CONSTRAINT security_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.security_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  max_login_attempts integer NOT NULL DEFAULT 5,
  lockout_duration integer NOT NULL DEFAULT 30,
  session_timeout integer NOT NULL DEFAULT 120,
  require_two_factor boolean NOT NULL DEFAULT false,
  password_policy jsonb NOT NULL DEFAULT '{"min_length": 8, "prevent_reuse": 5, "expiration_days": 90, "require_numbers": true, "require_lowercase": true, "require_uppercase": true, "require_special_chars": false}'::jsonb,
  audit_log_retention integer NOT NULL DEFAULT 365,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT security_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tour_guide_languages (
  id bigint NOT NULL DEFAULT nextval('tour_guide_languages_id_seq'::regclass),
  tour_guide_id bigint NOT NULL,
  language character varying NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tour_guide_languages_pkey PRIMARY KEY (id),
  CONSTRAINT tour_guide_languages_tour_guide_id_fkey FOREIGN KEY (tour_guide_id) REFERENCES public.tour_guides(id)
);
CREATE TABLE public.tour_guides (
  id bigint NOT NULL DEFAULT nextval('tour_guides_id_seq'::regclass),
  user_id bigint NOT NULL,
  bio text,
  specialties jsonb,
  location character varying NOT NULL,
  short_bio text,
  experience integer DEFAULT 0,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  availability character varying,
  is_verified boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  profile_picture text,
  CONSTRAINT tour_guides_pkey PRIMARY KEY (id),
  CONSTRAINT tour_guides_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.tours (
  id bigint NOT NULL DEFAULT nextval('tours_id_seq'::regclass),
  tour_guide_id bigint NOT NULL,
  title character varying NOT NULL,
  description text NOT NULL,
  location character varying NOT NULL,
  duration character varying NOT NULL,
  price numeric NOT NULL,
  max_group_size integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  destination_id bigint,
  CONSTRAINT tours_pkey PRIMARY KEY (id),
  CONSTRAINT tours_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id),
  CONSTRAINT tours_tour_guide_id_fkey FOREIGN KEY (tour_guide_id) REFERENCES public.tour_guides(id)
);
CREATE TABLE public.travel_tips (
  id bigint NOT NULL DEFAULT nextval('travel_tips_id_seq'::regclass),
  destination_id bigint NOT NULL,
  tip text NOT NULL,
  CONSTRAINT travel_tips_pkey PRIMARY KEY (id),
  CONSTRAINT travel_tips_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id)
);
CREATE TABLE public.user_sessions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  ip_address character varying NOT NULL,
  user_agent text NOT NULL,
  login_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  last_activity timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  is_active boolean DEFAULT true,
  location character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id bigint NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  email character varying NOT NULL UNIQUE,
  username character varying,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  email_verified_at timestamp without time zone,
  password character varying NOT NULL,
  role USER-DEFINED DEFAULT 'customer'::user_role,
  phone character varying,
  date_of_birth date,
  gender USER-DEFINED,
  profile_picture text,
  is_active boolean DEFAULT true,
  failed_login_attempts integer DEFAULT 0,
  locked_until timestamp without time zone,
  last_login_at timestamp without time zone,
  last_login_ip character varying,
  remember_token character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  experience character varying,
  languages ARRAY,
  bio text,
  location character varying,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);