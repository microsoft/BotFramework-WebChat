using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Mime;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace TokenSampleApi.Controllers
{
    [ApiController]
    public class DirectLineController : ControllerBase
    {
        private readonly string _directLineSecret;

        private readonly IHttpClientFactory _httpClientFactory;

        public DirectLineController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _directLineSecret = configuration["DirectLineSecret"];
            _httpClientFactory = httpClientFactory;
        }

        // Endpoint for generating a Direct Line token bound to a random user ID
        [HttpGet]
        [Route("/api/directLine/token")]
        public async Task<IActionResult> Get()
        {
            // Generate a random user ID to use for DirectLine token
            var randomUserId = GenerateRandomUserId();

            // Provide user ID in the request body to bind the user ID to the token
            var tokenRequestBody = new { user = new { id = randomUserId } };
            var tokenRequest = new HttpRequestMessage(HttpMethod.Post, "https://directline.botframework.com/v3/directline/tokens/generate")
            {
                Headers =
                {
                    Authorization = new AuthenticationHeaderValue("Bearer", _directLineSecret),
                },
                Content = new StringContent(JsonSerializer.Serialize(tokenRequestBody), Encoding.UTF8, MediaTypeNames.Application.Json),
            };
            
            // Call Direct Line API to generate a Direct Line token
            var httpClient = _httpClientFactory.CreateClient();
            var tokenResponse = await httpClient.SendAsync(tokenRequest);

            if (!tokenResponse.IsSuccessStatusCode)
            {
                return this.BadRequest();
            }
            
            var tokenResponseString = await tokenResponse.Content.ReadAsStringAsync();
            return this.Content(tokenResponseString, MediaTypeNames.Application.Json);
        }

        // Generates a random user ID
        // Prefixed with "dl_", as required by the Direct Line API
        private static string GenerateRandomUserId()
        {
            byte[] tokenData = new byte[16];
            using var rng = new RNGCryptoServiceProvider();
            rng.GetBytes(tokenData);

            return $"dl_{BitConverter.ToString(tokenData).Replace("-", "").ToLower()}";
        }
    }
}
