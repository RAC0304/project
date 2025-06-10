import DatabaseService from "./databaseService";
import {
  User,
  TourGuide,
  Destination,
  Tour,
  Booking,
  Review,
  Itinerary,
  SecurityLog,
  ItineraryRequest,
  ApiResponse,
  PaginatedResponse,
  QueryParams,
} from "../types/database";

class ApiService {
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  // User management
  async getUsers(params: QueryParams = {}): Promise<PaginatedResponse<User>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "created_at",
      sortOrder = "desc",
    } = params;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];

    if (search) {
      whereClause += ` AND (name ILIKE $${
        queryParams.length + 1
      } OR email ILIKE $${queryParams.length + 2})`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
    const dataQuery = `
      SELECT * FROM users 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      this.db.query(countQuery, queryParams.slice(0, -2)),
      this.db.query(dataQuery, queryParams),
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await this.db.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const {
      name,
      email,
      password,
      role = "customer",
      phone,
      date_of_birth,
      gender,
    } = userData;

    const result = await this.db.query(
      `
      INSERT INTO users (name, email, password, role, phone, date_of_birth, gender)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [name, email, password, role, phone, date_of_birth, gender]
    );

    return result.rows[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const updateFields = Object.keys(userData)
      .filter((key) => key !== "id")
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");

    const values = Object.values(userData).filter(
      (_, index) => Object.keys(userData)[index] !== "id"
    );

    const result = await this.db.query(
      `
      UPDATE users 
      SET ${updateFields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
      [id, ...values]
    );

    return result.rows[0];
  }

  // Tour Guide management
  async getTourGuides(
    params: QueryParams = {}
  ): Promise<PaginatedResponse<TourGuide & { user: User }>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "rating",
      sortOrder = "desc",
    } = params;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];

    if (search) {
      whereClause += ` AND (u.name ILIKE $${
        queryParams.length + 1
      } OR tg.location ILIKE $${queryParams.length + 2})`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const countQuery = `
      SELECT COUNT(*) FROM tour_guides tg
      JOIN users u ON tg.user_id = u.id
      ${whereClause}
    `;

    const dataQuery = `
      SELECT tg.*, u.name, u.email, u.profile_picture
      FROM tour_guides tg
      JOIN users u ON tg.user_id = u.id
      ${whereClause}
      ORDER BY tg.${sortBy} ${sortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      this.db.query(countQuery, queryParams.slice(0, -2)),
      this.db.query(dataQuery, queryParams),
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // Destinations management
  async getDestinations(
    params: QueryParams = {}
  ): Promise<PaginatedResponse<Destination>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "name",
      sortOrder = "asc",
    } = params;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];

    if (search) {
      whereClause += ` AND (name ILIKE $${
        queryParams.length + 1
      } OR location ILIKE $${queryParams.length + 2})`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const countQuery = `SELECT COUNT(*) FROM destinations ${whereClause}`;
    const dataQuery = `
      SELECT * FROM destinations 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      this.db.query(countQuery, queryParams.slice(0, -2)),
      this.db.query(dataQuery, queryParams),
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // Tours management
  async getTours(
    params: QueryParams = {}
  ): Promise<
    PaginatedResponse<Tour & { tour_guide: TourGuide & { user: User } }>
  > {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "created_at",
      sortOrder = "desc",
    } = params;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE t.is_active = true";
    const queryParams: any[] = [];

    if (search) {
      whereClause += ` AND (t.title ILIKE $${
        queryParams.length + 1
      } OR t.location ILIKE $${queryParams.length + 2})`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const dataQuery = `
      SELECT t.*, tg.*, u.name as guide_name, u.profile_picture as guide_avatar
      FROM tours t
      JOIN tour_guides tg ON t.tour_guide_id = tg.id
      JOIN users u ON tg.user_id = u.id
      ${whereClause}
      ORDER BY t.${sortBy} ${sortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, offset);

    const result = await this.db.query(dataQuery, queryParams);

    return {
      data: result.rows,
      total: result.rows.length,
      page,
      limit,
      totalPages: Math.ceil(result.rows.length / limit),
    };
  }

  // Bookings management
  async getBookings(
    params: QueryParams = {}
  ): Promise<PaginatedResponse<Booking & { tour: Tour; user: User }>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "created_at",
      sortOrder = "desc",
    } = params;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];

    if (search) {
      whereClause += ` AND (t.title ILIKE $${
        queryParams.length + 1
      } OR u.name ILIKE $${queryParams.length + 2})`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const dataQuery = `
      SELECT b.*, t.title as tour_title, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      JOIN users u ON b.user_id = u.id
      ${whereClause}
      ORDER BY b.${sortBy} ${sortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, offset);

    const result = await this.db.query(dataQuery, queryParams);

    return {
      data: result.rows,
      total: result.rows.length,
      page,
      limit,
      totalPages: Math.ceil(result.rows.length / limit),
    };
  }

  // Security Logs
  async getSecurityLogs(
    params: QueryParams = {}
  ): Promise<PaginatedResponse<SecurityLog & { user?: User }>> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "created_at",
      sortOrder = "desc",
    } = params;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const queryParams: any[] = [];

    if (search) {
      whereClause += ` AND (sl.action ILIKE $${
        queryParams.length + 1
      } OR sl.ip_address ILIKE $${queryParams.length + 2})`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const dataQuery = `
      SELECT sl.*, u.name as user_name, u.email as user_email
      FROM security_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
      ${whereClause}
      ORDER BY sl.${sortBy} ${sortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, offset);

    const result = await this.db.query(dataQuery, queryParams);

    return {
      data: result.rows,
      total: result.rows.length,
      page,
      limit,
      totalPages: Math.ceil(result.rows.length / limit),
    };
  }

  // Create security log
  async createSecurityLog(logData: Partial<SecurityLog>): Promise<SecurityLog> {
    const {
      user_id,
      action,
      ip_address,
      user_agent,
      status = "success",
      details,
    } = logData;

    const result = await this.db.query(
      `
      INSERT INTO security_logs (user_id, action, ip_address, user_agent, status, details)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [user_id, action, ip_address, user_agent, status, details]
    );

    return result.rows[0];
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    return await this.db.testConnection();
  }

  // Get database stats
  async getDatabaseStats(): Promise<any> {
    const queries = [
      "SELECT COUNT(*) as users_count FROM users",
      "SELECT COUNT(*) as tour_guides_count FROM tour_guides",
      "SELECT COUNT(*) as destinations_count FROM destinations",
      "SELECT COUNT(*) as tours_count FROM tours",
      "SELECT COUNT(*) as bookings_count FROM bookings",
      "SELECT COUNT(*) as reviews_count FROM reviews",
    ];

    const results = await Promise.all(
      queries.map((query) => this.db.query(query))
    );

    return {
      users: parseInt(results[0].rows[0].users_count),
      tourGuides: parseInt(results[1].rows[0].tour_guides_count),
      destinations: parseInt(results[2].rows[0].destinations_count),
      tours: parseInt(results[3].rows[0].tours_count),
      bookings: parseInt(results[4].rows[0].bookings_count),
      reviews: parseInt(results[5].rows[0].reviews_count),
      poolStatus: this.db.getPoolStatus(),
    };
  }
}

export default new ApiService();
