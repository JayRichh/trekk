using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Trekk.Core.Entities;

namespace Trekk.Api.Hubs
{
    public class TrailHub : Hub
    {
        // Connection management
        public override async Task OnConnectedAsync()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "AllUsers");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(System.Exception? exception)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "AllUsers");
            await base.OnDisconnectedAsync(exception);
        }

        // Join a specific trail group to receive updates for that trail
        public async Task JoinTrailGroup(string trailId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Trail_{trailId}");
        }

        // Leave a trail group
        public async Task LeaveTrailGroup(string trailId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Trail_{trailId}");
        }

        // Share user location with other hikers on the same trail
        public async Task UpdateUserLocation(string trailId, double latitude, double longitude, double elevation)
        {
            // In a real app, we would store this information and associate it with the user
            var userId = Context.ConnectionId; // In a real app, this would be the actual user ID
            
            await Clients.Group($"Trail_{trailId}").SendAsync(
                "UserLocationUpdated",
                userId,
                new { Latitude = latitude, Longitude = longitude, Elevation = elevation }
            );
        }

        // Methods that will be called from backend code to push updates to clients

        // Called when a trail is updated (conditions change, etc.)
        public async Task TrailUpdated(Trail trail)
        {
            await Clients.Group($"Trail_{trail.Id}").SendAsync("TrailUpdated", trail);
            await Clients.Group("AllUsers").SendAsync("TrailListUpdated");
        }

        // Called when weather conditions change for a trail
        public async Task WeatherUpdated(string trailId, object weatherData)
        {
            await Clients.Group($"Trail_{trailId}").SendAsync("WeatherUpdated", weatherData);
        }

        // Called when a new review is added
        public async Task ReviewAdded(string trailId, Review review)
        {
            await Clients.Group($"Trail_{trailId}").SendAsync("ReviewAdded", review);
            await Clients.Group("AllUsers").SendAsync("TrailListUpdated");
        }
    }
}
