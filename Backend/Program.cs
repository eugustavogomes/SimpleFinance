using Microsoft.EntityFrameworkCore;
using SimpleFinance.Api.Data;
using SimpleFinance.Api.Middlewares;
using SimpleFinance.Api.Repositories;
using SimpleFinance.Api.Repositories.Interfaces;
using SimpleFinance.Api.Services;
using jwtBearer;
using DotNetEnv;
using System.Text.Json.Serialization;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

// CORS
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL")
    ?? builder.Configuration["FRONTEND_URL"]
    ?? "http://localhost:3000";

builder.Services.AddCors(options =>
    options.AddPolicy("SecurePolicy", policy =>
        policy.WithOrigins(frontendUrl)
              .WithMethods("GET", "POST", "PUT", "DELETE")
              .WithHeaders("Authorization", "Content-Type")));

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(GetConnectionString(builder.Configuration))
           .UseSnakeCaseNamingConvention());

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<IGoalRepository, GoalRepository>();
builder.Services.AddScoped<IInvestmentRepository, InvestmentRepository>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<IGoalService, GoalService>();
builder.Services.AddScoped<IInvestmentService, InvestmentService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// JWT
builder.Services.AddJwtAuthentication(builder.Configuration);

var app = builder.Build();

// Run pending migrations on startup
using (var scope = app.Services.CreateScope())
    scope.ServiceProvider.GetRequiredService<ApplicationDbContext>().Database.Migrate();

app.UseCors("SecurePolicy");
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");

// Resolves DATABASE_URL (Railway URI format or Npgsql connection string)
// Falls back to individual PG* variables also provided by Railway
static string GetConnectionString(IConfiguration config)
{
    var url = Environment.GetEnvironmentVariable("DATABASE_URL")
              ?? config.GetConnectionString("DefaultConnection");

    if (!string.IsNullOrWhiteSpace(url))
    {
        if (url.StartsWith("postgres://") || url.StartsWith("postgresql://"))
        {
            var uri = new Uri(url.Replace("postgres://", "postgresql://"));
            var user = uri.UserInfo.Split(':');
            return $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};" +
                   $"Username={user[0]};Password={Uri.UnescapeDataString(user[1])};" +
                   $"SSL Mode=Require;Trust Server Certificate=true";
        }
        return url;
    }

    var host = Environment.GetEnvironmentVariable("PGHOST");
    if (!string.IsNullOrWhiteSpace(host))
    {
        return $"Host={host};" +
               $"Port={Environment.GetEnvironmentVariable("PGPORT") ?? "5432"};" +
               $"Database={Environment.GetEnvironmentVariable("PGDATABASE")};" +
               $"Username={Environment.GetEnvironmentVariable("PGUSER")};" +
               $"Password={Environment.GetEnvironmentVariable("PGPASSWORD")};" +
               $"SSL Mode=Require;Trust Server Certificate=true";
    }

    throw new InvalidOperationException(
        "Database not configured. Set DATABASE_URL (or PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD) in environment variables.");
}
