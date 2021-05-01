using System;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using TokenSampleApi.Models;
using TokenSampleApi.Services;

namespace TokenSampleApi.Controllers
{
    [ApiController]
    public class DirectLineController : ControllerBase
    {
        private readonly DirectLineService _directLineService;

        private readonly string _directLineSecret;

        public DirectLineController(DirectLineService directLineService, IConfiguration configuration)
        {
            _directLineService = directLineService;
            _directLineSecret = configuration["DirectLineSecret"];
        }

        // Endpoint for generating a Direct Line token bound to a random user ID
        [HttpGet]
        [Route("/api/directline/token")]
        public async Task<IActionResult> Get()
        {
            // Generate a random user ID to use for DirectLine token
            var randomUserId = GenerateRandomUserId();

            DirectLineTokenDetails directLineTokenDetails;
            try
            {
                directLineTokenDetails = await _directLineService.GetTokenAsync(_directLineSecret, randomUserId);
            }
            catch (InvalidOperationException invalidOpException)
            {
                return BadRequest(new { message = invalidOpException.Message });
            }

            return this.Ok(new { token = directLineTokenDetails.Token });
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
