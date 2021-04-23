using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Bot.Builder;
using Microsoft.Bot.Schema;

namespace TokenSampleBot.Bots
{
    public class UserIDBot : ActivityHandler
    {
        protected override async Task OnMessageActivityAsync(ITurnContext<IMessageActivity> turnContext, CancellationToken cancellationToken)
        {
            await turnContext.SendActivityAsync($"Your user ID is {turnContext.Activity.From.Id}");
        }

        protected override async Task OnMembersAddedAsync(IList<ChannelAccount> membersAdded, ITurnContext<IConversationUpdateActivity> turnContext, CancellationToken cancellationToken)
        {
            bool wasNonBotMemberAdded = membersAdded.Any(
                channelAccount => channelAccount.Id != turnContext.Activity.Recipient.Id);
            
            if (wasNonBotMemberAdded)
            {
                await turnContext.SendActivityAsync($"Hello! Your user ID is {turnContext.Activity.From.Id}");
            }
        }
    }
}