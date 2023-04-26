import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an S3 bucket for hosting the web app
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create a CloudFront Origin Access Identity (OAI)
    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI');

    // Grant the OAI read access to the S3 bucket
    websiteBucket.grantRead(oai);

    // Create a CloudFront distribution with the S3 bucket as the origin
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, { originAccessIdentity: oai }),
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED, // Optional: Disable caching if you want to ensure every request goes to the origin
      },
      defaultRootObject: 'index.html',
    });

    // Upload the React app build directory to the S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../build')], // Path to the build directory
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.domainName,
      description: 'The CloudFront distribution domain name',
    });
  }
}
