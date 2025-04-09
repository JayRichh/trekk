using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Trekk.Api.Hubs;
using Trekk.Core.Interfaces;
using Trekk.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure SignalR
builder.Services.AddSignalR();

// Register repositories
// Use Supabase repository in production, fallback to mock for development if needed
if (builder.Configuration["Supabase:Url"] != null && builder.Configuration["Supabase:Key"] != null)
{
    builder.Services.AddHttpClient();
    builder.Services.AddScoped<ITrailRepository, SupabaseTrailRepository>();
    Console.WriteLine("Using Supabase repository");
}
else
{
    builder.Services.AddSingleton<ITrailRepository, MockTrailRepository>();
    Console.WriteLine("Using mock repository (Supabase configuration missing)");
}

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Vue.js development server
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); // Required for SignalR
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("CorsPolicy");
app.UseAuthorization();

// Map controllers and SignalR hubs
app.MapControllers();
app.MapHub<TrailHub>("/hubs/trail");

app.Run();
