using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trekk.Core.Entities;
using Trekk.Core.Interfaces;

namespace Trekk.Infrastructure.Repositories
{
    public class MockTrailRepository : ITrailRepository
    {
        private readonly List<Trail> _trails;

        public MockTrailRepository()
        {
            // Initialize with sample data
            _trails = new List<Trail>
            {
                new Trail
                {
                    Id = "1",
                    Name = "Eagle Creek Trail",
                    Description = "A beautiful trail along Eagle Creek with waterfalls and scenic views.",
                    Length = 7.5,
                    ElevationGain = 350,
                    EstimatedTime = "3-4 hours",
                    Difficulty = "moderate",
                    ImageUrl = "https://images.unsplash.com/photo-1551632811-561732d1e306",
                    Coordinates = new List<Coordinate>
                    {
                        new Coordinate { Longitude = -122.4194, Latitude = 37.7749, Elevation = 0 },
                        new Coordinate { Longitude = -122.4184, Latitude = 37.7746, Elevation = 50 },
                        new Coordinate { Longitude = -122.4174, Latitude = 37.7744, Elevation = 100 },
                        new Coordinate { Longitude = -122.4164, Latitude = 37.7742, Elevation = 150 },
                        new Coordinate { Longitude = -122.4154, Latitude = 37.7740, Elevation = 200 }
                    },
                    TerrainType = "Mixed terrain with some rocky sections and well-maintained paths.",
                    BestTimeToVisit = "Spring through Fall. Summer can be hot, consider early morning hikes.",
                    WaterSources = "Several streams along the route. Bring filtration.",
                    CellReception = "Spotty. Download maps for offline use before your hike.",
                    Reviews = new List<Review>
                    {
                        new Review
                        {
                            Id = "r1",
                            Author = "Alex Johnson",
                            Date = "April 15, 2025",
                            Rating = 5,
                            Text = "Absolutely stunning trail! The views are breathtaking and the terrain is varied enough to keep it interesting. Highly recommend starting early to avoid crowds.",
                            TrailId = "1"
                        },
                        new Review
                        {
                            Id = "r2",
                            Author = "Sam Wilson",
                            Date = "March 22, 2025",
                            Rating = 4,
                            Text = "Great hike with beautiful scenery. Some sections were a bit challenging but overall manageable for someone with moderate fitness. Bring plenty of water!",
                            TrailId = "1"
                        },
                        new Review
                        {
                            Id = "r3",
                            Author = "Taylor Martinez",
                            Date = "February 10, 2025",
                            Rating = 3,
                            Text = "Nice trail but quite crowded on weekends. The elevation gain was more challenging than I expected. The waterfall at the halfway point is worth it though.",
                            TrailId = "1"
                        }
                    }
                },
                new Trail
                {
                    Id = "2",
                    Name = "Mount Mitchell Summit",
                    Description = "Challenging hike to the highest peak in the eastern United States.",
                    Length = 12,
                    ElevationGain = 1100,
                    EstimatedTime = "6-7 hours",
                    Difficulty = "difficult",
                    ImageUrl = "https://images.unsplash.com/photo-1551632811-561732d1e306",
                    Coordinates = new List<Coordinate>
                    {
                        new Coordinate { Longitude = -122.5194, Latitude = 37.8749, Elevation = 200 },
                        new Coordinate { Longitude = -122.5184, Latitude = 37.8746, Elevation = 300 },
                        new Coordinate { Longitude = -122.5174, Latitude = 37.8744, Elevation = 500 },
                        new Coordinate { Longitude = -122.5164, Latitude = 37.8742, Elevation = 750 },
                        new Coordinate { Longitude = -122.5154, Latitude = 37.8740, Elevation = 1100 }
                    },
                    TerrainType = "Steep, rocky terrain with some exposed sections near the summit.",
                    BestTimeToVisit = "Summer and early Fall. Winter can bring snow and dangerous conditions.",
                    WaterSources = "Limited. Bring at least 3 liters per person.",
                    CellReception = "Good at the summit, limited on the ascent.",
                    Reviews = new List<Review>()
                },
                new Trail
                {
                    Id = "3",
                    Name = "Riverside Loop",
                    Description = "An easy, scenic loop along the river suitable for all skill levels.",
                    Length = 3.2,
                    ElevationGain = 50,
                    EstimatedTime = "1-2 hours",
                    Difficulty = "easy",
                    ImageUrl = "https://images.unsplash.com/photo-1551632811-561732d1e306",
                    Coordinates = new List<Coordinate>
                    {
                        new Coordinate { Longitude = -122.3194, Latitude = 37.6749, Elevation = 10 },
                        new Coordinate { Longitude = -122.3184, Latitude = 37.6746, Elevation = 15 },
                        new Coordinate { Longitude = -122.3174, Latitude = 37.6744, Elevation = 20 },
                        new Coordinate { Longitude = -122.3164, Latitude = 37.6742, Elevation = 25 },
                        new Coordinate { Longitude = -122.3154, Latitude = 37.6740, Elevation = 10 }
                    },
                    TerrainType = "Flat, well-maintained dirt path.",
                    BestTimeToVisit = "Year-round. Beautiful wildflowers in spring.",
                    WaterSources = "Water fountains at trailhead.",
                    CellReception = "Excellent throughout the trail.",
                    Reviews = new List<Review>()
                },
                new Trail
                {
                    Id = "4",
                    Name = "Glacier Point",
                    Description = "Spectacular views of the valley and surrounding mountains.",
                    Length = 15.5,
                    ElevationGain = 1800,
                    EstimatedTime = "8-10 hours",
                    Difficulty = "extreme",
                    ImageUrl = "https://images.unsplash.com/photo-1551632811-561732d1e306",
                    Coordinates = new List<Coordinate>
                    {
                        new Coordinate { Longitude = -122.6194, Latitude = 37.9749, Elevation = 300 },
                        new Coordinate { Longitude = -122.6184, Latitude = 37.9746, Elevation = 500 },
                        new Coordinate { Longitude = -122.6174, Latitude = 37.9744, Elevation = 800 },
                        new Coordinate { Longitude = -122.6164, Latitude = 37.9742, Elevation = 1200 },
                        new Coordinate { Longitude = -122.6154, Latitude = 37.9740, Elevation = 1800 }
                    },
                    TerrainType = "Extremely steep with technical sections requiring scrambling.",
                    BestTimeToVisit = "Mid-summer when snow has melted. Not recommended in winter.",
                    WaterSources = "None. Bring at least 4 liters per person.",
                    CellReception = "Very limited. Carry emergency communication device.",
                    Reviews = new List<Review>()
                }
            };
        }

        public Task<IEnumerable<Trail>> GetAllTrailsAsync()
        {
            return Task.FromResult(_trails.AsEnumerable());
        }

        public Task<Trail?> GetTrailByIdAsync(string id)
        {
            var trail = _trails.FirstOrDefault(t => t.Id == id);
            return Task.FromResult(trail);
        }

        public Task<Trail?> AddTrailAsync(Trail trail)
        {
            trail.Id = (_trails.Count + 1).ToString();
            _trails.Add(trail);
            return Task.FromResult(trail);
        }

        public Task<Trail?> UpdateTrailAsync(Trail trail)
        {
            var existingTrail = _trails.FirstOrDefault(t => t.Id == trail.Id);
            if (existingTrail == null)
            {
                return Task.FromResult<Trail?>(null);
            }

            var index = _trails.IndexOf(existingTrail);
            _trails[index] = trail;
            return Task.FromResult(trail);
        }

        public Task<bool> DeleteTrailAsync(string id)
        {
            var trail = _trails.FirstOrDefault(t => t.Id == id);
            if (trail == null)
            {
                return Task.FromResult(false);
            }

            _trails.Remove(trail);
            return Task.FromResult(true);
        }

        public Task<IEnumerable<Trail>> SearchTrailsAsync(string? searchTerm, string? difficulty, double? minLength, double? maxLength)
        {
            var query = _trails.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(t => 
                    t.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) || 
                    t.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(difficulty))
            {
                query = query.Where(t => t.Difficulty.Equals(difficulty, StringComparison.OrdinalIgnoreCase));
            }

            if (minLength.HasValue)
            {
                query = query.Where(t => t.Length >= minLength.Value);
            }

            if (maxLength.HasValue)
            {
                query = query.Where(t => t.Length <= maxLength.Value);
            }

            return Task.FromResult(query);
        }

        public Task<Review?> AddReviewAsync(Review review)
        {
            var trail = _trails.FirstOrDefault(t => t.Id == review.TrailId);
            if (trail == null)
            {
                return Task.FromResult<Review?>(null);
            }

            review.Id = $"r{Guid.NewGuid().ToString("N").Substring(0, 8)}";
            review.Date = DateTime.Now.ToString("MMMM d, yyyy");
            trail.Reviews.Add(review);
            return Task.FromResult(review);
        }
    }
}
