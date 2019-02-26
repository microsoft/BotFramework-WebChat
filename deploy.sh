while getopts m: option
    do
    case "${option}"
        in
        m) MODE=${OPTARG};;
    esac
done

DIST_ID="E2EY31LM1DTKH1"
S3="com.gideon.chatbot.dev/development"

if [ "$MODE" == "production" ]
then
    S3="com.gideon.chatbot.dev/latest"
fi

# build code / assets
npm run prepublish

# push to appropriate s3 bucket ( requires aws cli login, s3 permissions )
aws s3 sync --acl public-read --sse --delete public s3://$S3

# invalidate cloudfront distribution
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"