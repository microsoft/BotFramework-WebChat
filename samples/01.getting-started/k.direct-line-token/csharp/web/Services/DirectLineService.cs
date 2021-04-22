using System;
using System.Net.Http;
using System.Net.Mime;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using TokenSampleApi.Models;

namespace TokenSampleApi.Services
{
    public class DirectLineService
    {
        private readonly HttpClient _httpClient;

        public DirectLineService(HttpClient httpClient)
        {
            httpClient.BaseAddress = new Uri("https://directline.botframework.com/");

            _httpClient = httpClient;
        }

        // Generates a new Direct Line token given the secret.
        // Provides user ID in the request body to bind the user ID to the token.
        public async Task<DirectLineTokenDetails> GetTokenAsync(string directLineSecret, string userId, CancellationToken cancellationToken = default)
        {
            var tokenRequestBody = new { user = new { id = userId } };
            var tokenRequest = new HttpRequestMessage(HttpMethod.Post, "v3/directline/tokens/generate")
            {
                Headers =
                {
                    { "Authorization", $"Bearer {directLineSecret}" },
                },
                Content = new StringContent(JsonSerializer.Serialize(tokenRequestBody), Encoding.UTF8, MediaTypeNames.Application.Json),
            };

            var tokenResponseMessage = await _httpClient.SendAsync(tokenRequest, cancellationToken);

            if (!tokenResponseMessage.IsSuccessStatusCode)
            {
                throw new InvalidOperationException($"Direct Line token API call failed with status code {tokenResponseMessage.StatusCode}");
            }

            using var responseContentStream = await tokenResponseMessage.Content.ReadAsStreamAsync();
            var tokenResponse = await JsonSerializer.DeserializeAsync<DirectLineTokenApiResponse>(responseContentStream);

            return new DirectLineTokenDetails
            {
                Token = tokenResponse.Token,
                ConversationId = tokenResponse.ConversationId,
                ExpiresIn = tokenResponse.ExpiresIn,
            };
        }

        private class DirectLineTokenApiResponse
        {
            [JsonPropertyName("token")]
            public string Token { get; set; }

            [JsonPropertyName("expires_in")]
            public int ExpiresIn { get; set; }

            [JsonPropertyName("conversationId")]
            public string ConversationId { get; set; }
        }
    }
}