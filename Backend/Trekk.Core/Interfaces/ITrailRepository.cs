using System.Collections.Generic;
using System.Threading.Tasks;
using Trekk.Core.Entities;

namespace Trekk.Core.Interfaces
{
    public interface ITrailRepository
    {
        Task<IEnumerable<Trail>> GetAllTrailsAsync();
        Task<Trail?> GetTrailByIdAsync(string id);
        Task<Trail?> AddTrailAsync(Trail trail);
        Task<Trail?> UpdateTrailAsync(Trail trail);
        Task<bool> DeleteTrailAsync(string id);
        Task<IEnumerable<Trail>> SearchTrailsAsync(string? searchTerm, string? difficulty, double? minLength, double? maxLength);
        Task<Review?> AddReviewAsync(Review review);
    }
}
