namespace TokenSampleApi.Models
{
    public class DirectLineTokenDetails
    {
        public string Token { get; set; }

        public int ExpiresIn { get; set; }

        public string ConversationId { get; set; }
    }
}