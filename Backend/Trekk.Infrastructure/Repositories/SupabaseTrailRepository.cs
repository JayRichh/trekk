using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Trekk.Core.Entities;
using Trekk.Core.Interfaces;

namespace Trekk.Infrastructure.Repositories
{
    public class SupabaseTrailRepository : ITrailRepository
    {
        private readonly HttpClient _httpClient;
        private readonly string _supabaseUrl;
        private readonly string _supabaseKey;
        private readonly JsonSerializerOptions _jsonOptions;
        
        public SupabaseTrailRepository(IConfiguration configuration, HttpClient? httpClient = null)
        {
            _supabaseUrl = configuration["Supabase:Url"] ?? 
                throw new ArgumentNullException("Supabase:Url configuration is missing");
            _supabaseKey = configuration["Supabase:Key"] ?? 
                throw new ArgumentNullException("Supabase:Key configuration is missing");
            
            _httpClient = httpClient ?? new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("apikey", _supabaseKey);
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_supabaseKey}");
            
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
        }
        
        public async Task<IEnumerable<Trail>> GetAllTrailsAsync()
        {
            return await GetPaginatedTrailsAsync(0, 100);
        }
        
        public async Task<IEnumerable<Trail>> GetPaginatedTrailsAsync(int page, int pageSize)
        {
            try
            {
                var offset = page * pageSize;
                var url = $"{_supabaseUrl}/rest/v1/trails?select=*&order=name.asc&limit={pageSize}&offset={offset}";
                
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                var trails = JsonSerializer.Deserialize<List<Trail>>(content, _jsonOptions) ?? new List<Trail>();
                
                // Fetch ratings for each trail
                if (trails.Any())
                {
                    var trailIds = trails.Select(t => t.Id).ToList();
                    await AttachRatingsToTrailsAsync(trails, trailIds);
                }
                
                return trails;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching trails: {ex.Message}");
                return new List<Trail>();
            }
        }
        
        public async Task<Trail?> GetTrailByIdAsync(string id)
        {
            try
            {
                var url = $"{_supabaseUrl}/rest/v1/trails?id=eq.{id}&select=*";
                
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                var trails = JsonSerializer.Deserialize<List<Trail>>(content, _jsonOptions) ?? new List<Trail>();
                
                var trail = trails.FirstOrDefault();
                if (trail != null)
                {
                    // Fetch ratings for this trail
                    await AttachRatingsToTrailsAsync(new List<Trail> { trail }, new List<string> { id });
                }
                
                return trail;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching trail {id}: {ex.Message}");
                return null;
            }
        }
        
        public async Task<Trail?> AddTrailAsync(Trail trail)
        {
            try
            {
                var url = $"{_supabaseUrl}/rest/v1/trails";
                
                var content = new StringContent(
                    JsonSerializer.Serialize(trail, _jsonOptions),
                    Encoding.UTF8,
                    "application/json");
                
                var response = await _httpClient.PostAsync(url, content);
                response.EnsureSuccessStatusCode();
                
                // Supabase returns the created record
                var responseContent = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<Trail>(responseContent, _jsonOptions);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding trail: {ex.Message}");
                return null;
            }
        }
        
        public async Task<Trail?> UpdateTrailAsync(Trail trail)
        {
            try
            {
                var url = $"{_supabaseUrl}/rest/v1/trails?id=eq.{trail.Id}";
                
                var content = new StringContent(
                    JsonSerializer.Serialize(trail, _jsonOptions),
                    Encoding.UTF8,
                    "application/json");
                
                // Use PATCH to update only the provided fields
                var request = new HttpRequestMessage(new HttpMethod("PATCH"), url)
                {
                    Content = content
                };
                
                var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();
                
                // Fetch the updated trail
                return await GetTrailByIdAsync(trail.Id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating trail {trail.Id}: {ex.Message}");
                return null;
            }
        }
        
        public async Task<bool> DeleteTrailAsync(string id)
        {
            try
            {
                var url = $"{_supabaseUrl}/rest/v1/trails?id=eq.{id}";
                
                var response = await _httpClient.DeleteAsync(url);
                response.EnsureSuccessStatusCode();
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting trail {id}: {ex.Message}");
                return false;
            }
        }
        
        public async Task<IEnumerable<Trail>> SearchTrailsAsync(
            string? searchTerm, 
            string? difficulty, 
            double? minLength, 
            double? maxLength)
        {
            try
            {
                var queryParams = new List<string>();
                
                // Build query parameters
                if (!string.IsNullOrWhiteSpace(searchTerm))
                {
                    queryParams.Add($"or=(name.ilike.%{Uri.EscapeDataString(searchTerm)}%,description.ilike.%{Uri.EscapeDataString(searchTerm)}%)");
                }
                
                if (!string.IsNullOrWhiteSpace(difficulty))
                {
                    queryParams.Add($"difficulty=eq.{Uri.EscapeDataString(difficulty)}");
                }
                
                if (minLength.HasValue)
                {
                    queryParams.Add($"length=gte.{minLength.Value}");
                }
                
                if (maxLength.HasValue)
                {
                    queryParams.Add($"length=lte.{maxLength.Value}");
                }
                
                // Construct the URL with query parameters
                var url = $"{_supabaseUrl}/rest/v1/trails?select=*";
                if (queryParams.Any())
                {
                    url += "&" + string.Join("&", queryParams);
                }
                
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                var trails = JsonSerializer.Deserialize<List<Trail>>(content, _jsonOptions) ?? new List<Trail>();
                
                // Fetch ratings for each trail
                if (trails.Any())
                {
                    var trailIds = trails.Select(t => t.Id).ToList();
                    await AttachRatingsToTrailsAsync(trails, trailIds);
                }
                
                return trails;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error searching trails: {ex.Message}");
                return new List<Trail>();
            }
        }
        
        public async Task<Review?> AddReviewAsync(Review review)
        {
            try
            {
                var url = $"{_supabaseUrl}/rest/v1/trail_ratings";
                
                // Map Review to trail_ratings format
                var ratingData = new
                {
                    trail_id = review.TrailId,
                    user_id = Guid.NewGuid().ToString(), // In a real app, this would be the authenticated user's ID
                    rating = review.Rating,
                    comment = review.Text,
                    tips = "", // Add this field if needed
                    photos = new string[] { } // Add photos if needed
                };
                
                var content = new StringContent(
                    JsonSerializer.Serialize(ratingData, _jsonOptions),
                    Encoding.UTF8,
                    "application/json");
                
                var response = await _httpClient.PostAsync(url, content);
                response.EnsureSuccessStatusCode();
                
                // Set the review ID and date
                review.Id = Guid.NewGuid().ToString();
                review.Date = DateTime.Now.ToString("MMMM d, yyyy");
                
                return review;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding review: {ex.Message}");
                return null;
            }
        }
        
        private async Task AttachRatingsToTrailsAsync(IEnumerable<Trail> trails, List<string> trailIds)
        {
            try
            {
                // Create a dictionary to store ratings by trail ID
                var ratingsByTrailId = new Dictionary<string, List<Review>>();
                
                // Initialize empty lists for each trail ID
                foreach (var trailId in trailIds)
                {
                    ratingsByTrailId[trailId] = new List<Review>();
                }
                
                // Use the trail_ratings_with_users view directly with an IN filter - no batching
                // Join all trail IDs together in one query
                var trailIdsParam = string.Join(",", trailIds.Select(id => $"\"{id}\""));
                var url = $"{_supabaseUrl}/rest/v1/trail_ratings_with_users?trail_id=in.({trailIdsParam})";
                
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                
                var responseContent = await response.Content.ReadAsStringAsync();
                var ratings = JsonSerializer.Deserialize<List<JsonElement>>(responseContent, _jsonOptions);
                
                // Process all ratings
                if (ratings != null)
                {
                    foreach (var rating in ratings)
                    {
                        var trailId = rating.GetProperty("trail_id").GetString();
                        
                        if (trailId != null && ratingsByTrailId.ContainsKey(trailId))
                        {
                            var review = new Review
                            {
                                Id = rating.GetProperty("id").GetString() ?? string.Empty,
                                Author = rating.GetProperty("display_name").ValueKind != JsonValueKind.Null 
                                    ? rating.GetProperty("display_name").GetString() ?? "Anonymous"
                                    : "Anonymous",
                                Date = DateTime.Parse(rating.GetProperty("created_at").GetString() ?? DateTime.UtcNow.ToString()).ToString("MMMM d, yyyy"),
                                Rating = rating.GetProperty("rating").GetInt32(),
                                Text = rating.GetProperty("comment").ValueKind != JsonValueKind.Null 
                                    ? rating.GetProperty("comment").GetString() ?? ""
                                    : "",
                                TrailId = trailId
                            };
                            
                            ratingsByTrailId[trailId].Add(review);
                        }
                    }
                }
                
                // Attach ratings to trails
                foreach (var trail in trails)
                {
                    if (ratingsByTrailId.TryGetValue(trail.Id, out var reviews))
                    {
                        trail.Reviews = reviews;
                    }
                    else
                    {
                        trail.Reviews = new List<Review>();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error attaching ratings to trails: {ex.Message}");
            }
        }
    }
}
