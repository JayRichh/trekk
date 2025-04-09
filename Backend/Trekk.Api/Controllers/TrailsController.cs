using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Trekk.Api.Hubs;
using Trekk.Core.Entities;
using Trekk.Core.Interfaces;

namespace Trekk.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TrailsController : ControllerBase
    {
        private readonly ITrailRepository _trailRepository;
        private readonly IHubContext<TrailHub> _hubContext;

        public TrailsController(ITrailRepository trailRepository, IHubContext<TrailHub> hubContext)
        {
            _trailRepository = trailRepository;
            _hubContext = hubContext;
        }

        // GET: api/trails
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Trail>>> GetTrails()
        {
            var trails = await _trailRepository.GetAllTrailsAsync();
            return Ok(trails);
        }

        // GET: api/trails/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Trail>> GetTrail(string id)
        {
            var trail = await _trailRepository.GetTrailByIdAsync(id);
            
            if (trail == null)
            {
                return NotFound();
            }
            
            return Ok(trail);
        }

        // POST: api/trails
        [HttpPost]
        public async Task<ActionResult<Trail>> CreateTrail([FromBody] Trail trail)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var createdTrail = await _trailRepository.AddTrailAsync(trail);
            
            if (createdTrail == null)
            {
                return BadRequest("Failed to create trail");
            }
            
            // Notify connected clients about the new trail
            await _hubContext.Clients.Group("AllUsers").SendAsync("TrailListUpdated");
            
            return CreatedAtAction(nameof(GetTrail), new { id = createdTrail.Id }, createdTrail);
        }

        // PUT: api/trails/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTrail(string id, [FromBody] Trail trail)
        {
            if (id != trail.Id)
            {
                return BadRequest();
            }
            
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var updatedTrail = await _trailRepository.UpdateTrailAsync(trail);
            
            if (updatedTrail == null)
            {
                return NotFound();
            }
            
            // Notify connected clients about the updated trail
            await _hubContext.Clients.Group($"Trail_{id}").SendAsync("TrailUpdated", updatedTrail);
            await _hubContext.Clients.Group("AllUsers").SendAsync("TrailListUpdated");
            
            return NoContent();
        }

        // DELETE: api/trails/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrail(string id)
        {
            var result = await _trailRepository.DeleteTrailAsync(id);
            
            if (!result)
            {
                return NotFound();
            }
            
            // Notify connected clients about the deleted trail
            await _hubContext.Clients.Group("AllUsers").SendAsync("TrailListUpdated");
            
            return NoContent();
        }

        // GET: api/trails/search
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Trail>>> SearchTrails(
            [FromQuery] string? term, 
            [FromQuery] string? difficulty, 
            [FromQuery] double? minLength = null, 
            [FromQuery] double? maxLength = null)
        {
            var trails = await _trailRepository.SearchTrailsAsync(term, difficulty, minLength, maxLength);
            return Ok(trails);
        }

        // POST: api/trails/{trailId}/reviews
        [HttpPost("{trailId}/reviews")]
        public async Task<ActionResult<Review>> AddReview(string trailId, [FromBody] Review review)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            review.TrailId = trailId;
            var addedReview = await _trailRepository.AddReviewAsync(review);
            
            if (addedReview == null)
            {
                return NotFound();
            }
            
            // Notify connected clients about the new review
            await _hubContext.Clients.Group($"Trail_{trailId}").SendAsync("ReviewAdded", addedReview);
            await _hubContext.Clients.Group("AllUsers").SendAsync("TrailListUpdated");
            
            return Ok(addedReview);
        }
    }
}
