using System.Collections.Generic;

namespace Trekk.Core.Entities
{
    public class Trail
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public double Length { get; set; }
        public int ElevationGain { get; set; }
        public string EstimatedTime { get; set; }
        public string Difficulty { get; set; }
        public string ImageUrl { get; set; }
        public List<Coordinate> Coordinates { get; set; } = new List<Coordinate>();
        public string TerrainType { get; set; }
        public string BestTimeToVisit { get; set; }
        public string WaterSources { get; set; }
        public string CellReception { get; set; }
        public List<Review> Reviews { get; set; } = new List<Review>();
    }

    public class Coordinate
    {
        public double Longitude { get; set; }
        public double Latitude { get; set; }
        public double Elevation { get; set; }
    }

    public class Review
    {
        public string Id { get; set; }
        public string Author { get; set; }
        public string Date { get; set; }
        public int Rating { get; set; }
        public string Text { get; set; }
        public string TrailId { get; set; }
        public Trail Trail { get; set; }
    }
}
